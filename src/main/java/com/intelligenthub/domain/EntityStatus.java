package com.intelligenthub.domain;

// 枚举类型定义
public enum EntityStatus {
    ACTIVE("active", "活跃"),
    INACTIVE("inactive", "非活跃"),
    DELETED("deleted", "已删除"),
    ARCHIVED("archived", "已归档");

    private final String code;
    private final String description;

    EntityStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}

public enum OperationType {
    CREATE("create", "创建"),
    UPDATE("update", "更新"),
    DELETE("delete", "删除"),
    QUERY("query", "查询"),
    EXPORT("export", "导出"),
    IMPORT("import", "导入");

    private final String code;
    private final String description;

    OperationType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}