package com.intelligenthub.domain.user;

import com.intelligenthub.domain.*;
import java.util.*;

// 用户聚合根
public class User implements AggregateRoot {
    private String id;
    private String username;
    private String email;
    private String phone;
    private String password;
    private UserProfile profile;
    private UserStatus status;
    private Set<Role> roles;
    private Set<Permission> permissions;
    private Date lastLoginAt;
    private Integer loginCount;
    private Date createdAt;
    private Date updatedAt;
    private String createdBy;
    private String updatedBy;
    private Integer version;
    private final transient List<DomainEvent> domainEvents = new ArrayList<>();

    // 业务方法
    public void changePassword(String oldPassword, String newPassword) {
        // 密码变更逻辑
        this.registerEvent(new UserPasswordChangedEvent(this.id, newPassword));
    }

    public void assignRole(Role role) {
        this.roles.add(role);
        this.registerEvent(new UserRoleAssignedEvent(this.id, role.getId()));
    }

    public boolean hasPermission(String permissionCode) {
        return this.permissions.stream()
                .anyMatch(p -> p.getCode().equals(permissionCode));
    }

    // 聚合根方法
    @Override
    public Collection<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    @Override
    public void clearDomainEvents() {
        domainEvents.clear();
    }

    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    // getters and setters...
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public UserProfile getProfile() { return profile; }
    public void setProfile(UserProfile profile) { this.profile = profile; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public Set<Permission> getPermissions() { return permissions; }
    public void setPermissions(Set<Permission> permissions) { this.permissions = permissions; }
    public Date getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Date lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public Integer getLoginCount() { return loginCount; }
    public void setLoginCount(Integer loginCount) { this.loginCount = loginCount; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}