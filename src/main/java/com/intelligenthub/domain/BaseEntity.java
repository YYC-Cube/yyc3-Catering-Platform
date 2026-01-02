package com.intelligenthub.domain;

import java.util.Collection;
import java.util.Date;

// 基础实体接口
public interface BaseEntity<T> {
    T getId();
    void setId(T id);
    Date getCreatedAt();
    void setCreatedAt(Date createdAt);
    Date getUpdatedAt();
    void setUpdatedAt(Date updatedAt);
    String getCreatedBy();
    void setCreatedBy(String createdBy);
    String getUpdatedBy();
    void setUpdatedBy(String updatedBy);
    Integer getVersion();
    void setVersion(Integer version);
}

// 聚合根标记接口
public interface AggregateRoot extends BaseEntity<String> {
    Collection<DomainEvent> getDomainEvents();
    void clearDomainEvents();
}

// 值对象标记接口
public interface ValueObject {
    boolean equals(Object obj);
    int hashCode();
    String toString();
}

// 领域事件接口
public interface DomainEvent {
    String getEventId();
    Date getOccurredOn();
    String getEventType();
    String getAggregateId();
    String getAggregateType();
}