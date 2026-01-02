-- 分库分表策略配置
CREATE TABLE sharding_config (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    sharding_strategy sharding_strategy NOT NULL,
    sharding_key VARCHAR(100) NOT NULL,
    shards_count INTEGER NOT NULL DEFAULT 4,
    sharding_algorithm sharding_algorithm NOT NULL DEFAULT 'hash',
    algorithm_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(table_name)
);

CREATE TYPE sharding_strategy AS ENUM (
    'horizontal',  -- 水平分表
    'vertical',    -- 垂直分库
    'hybrid'       -- 混合分片
);

CREATE TYPE sharding_algorithm AS ENUM (
    'hash',        -- 哈希分片
    'range',       -- 范围分片
    'time',        -- 时间分片
    'custom'       -- 自定义算法
);

-- 用户表分片配置（按用户ID哈希分片）
INSERT INTO sharding_config (
    table_name,
    sharding_strategy,
    sharding_key,
    shards_count,
    sharding_algorithm,
    algorithm_config
) VALUES (
    'users',
    'horizontal',
    'id',
    8,
    'hash',
    '{"hashFunction": "crc32", "virtualNodes": 160}'
);

-- AI请求记录分片配置（按月分片）
INSERT INTO sharding_config (
    table_name,
    sharding_strategy,
    sharding_key,
    shards_count,
    sharding_algorithm,
    algorithm_config
) VALUES (
    'ai_requests',
    'horizontal',
    'created_at',
    12,
    'time',
    '{"timeUnit": "month", "retentionMonths": 24}'
);

-- 分片路由表
CREATE TABLE shard_routing (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    shard_key VARCHAR(255) NOT NULL,
    shard_id INTEGER NOT NULL,
    database_name VARCHAR(100) NOT NULL,
    schema_name VARCHAR(100) NOT NULL,
    table_suffix VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(table_name, shard_key, shard_id)
);

-- 分片管理函数
CREATE OR REPLACE FUNCTION get_shard_info(
    p_table_name VARCHAR,
    p_shard_key VARCHAR
) RETURNS TABLE(
    shard_id INTEGER,
    database_name VARCHAR,
    schema_name VARCHAR,
    physical_table_name VARCHAR
) AS $$
DECLARE
    v_config sharding_config;
    v_shard_id INTEGER;
BEGIN
    -- 获取分片配置
    SELECT * INTO v_config
    FROM sharding_config
    WHERE table_name = p_table_name;

    -- 计算分片ID
    IF v_config.sharding_algorithm = 'hash' THEN
        v_shard_id := abs(hashtext(p_shard_key)) % v_config.shards_count;
    ELSIF v_config.sharding_algorithm = 'time' THEN
        -- 时间分片逻辑
        v_shard_id := extract(month FROM p_shard_key::TIMESTAMPTZ);
    ELSE
        v_shard_id := 0;
    END IF;

    -- 返回分片信息
    RETURN QUERY
    SELECT
        sr.shard_id,
        sr.database_name,
        sr.schema_name,
        sr.table_suffix
    FROM shard_routing sr
    WHERE sr.table_name = p_table_name
    AND sr.shard_key = p_shard_key
    AND sr.shard_id = v_shard_id;
END;
$$ LANGUAGE plpgsql;