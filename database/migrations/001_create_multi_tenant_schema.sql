-- 多租户数据库架构设计
-- 采用混合隔离策略：独立Schema + 租户ID字段

-- 租户主表
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    status tenant_status NOT NULL DEFAULT 'active',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 0
);

-- 租户状态枚举
CREATE TYPE tenant_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'terminated'
);

-- 租户数据库配置
CREATE TABLE tenant_databases (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id),
    database_name VARCHAR(100) NOT NULL,
    schema_name VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 5432,
    username VARCHAR(100) NOT NULL,
    status database_status NOT NULL DEFAULT 'active',
    connection_pool_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, database_name)
);

CREATE TYPE database_status AS ENUM (
    'active',
    'maintenance',
    'migrating',
    'inactive'
);

-- 租户隔离策略配置
CREATE TABLE tenant_isolation_config (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id),
    isolation_level isolation_level NOT NULL DEFAULT 'schema',
    schema_name VARCHAR(100),
    database_name VARCHAR(100),
    table_prefix VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id)
);

CREATE TYPE isolation_level AS ENUM (
    'database',    -- 独立数据库
    'schema',      -- 独立Schema
    'table',       -- 表前缀隔离
    'column'       -- 租户ID字段隔离
);

-- 多租户数据访问视图
CREATE OR REPLACE VIEW tenant_data_access AS
SELECT
    t.id as tenant_id,
    t.name as tenant_name,
    t.code as tenant_code,
    td.database_name,
    td.schema_name,
    td.host,
    td.port,
    ic.isolation_level
FROM tenants t
JOIN tenant_databases td ON t.id = td.tenant_id
JOIN tenant_isolation_config ic ON t.id = ic.tenant_id
WHERE t.status = 'active' AND td.status = 'active';