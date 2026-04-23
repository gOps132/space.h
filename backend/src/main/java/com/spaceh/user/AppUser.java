package com.spaceh.user;

import java.time.LocalDateTime;

import com.spaceh.common.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class AppUser extends BaseEntity {

    @Column(name = "university_id", nullable = false, unique = true, length = 50)
    private String universityId;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 30)
    private AccountStatus accountStatus;

    @Column(name = "banned_until")
    private LocalDateTime bannedUntil;

    protected AppUser() {
    }

    public AppUser(
            String universityId,
            String fullName,
            String email,
            String passwordHash,
            UserRole role,
            AccountStatus accountStatus
    ) {
        this.universityId = universityId;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.accountStatus = accountStatus;
    }

    public String getUniversityId() {
        return universityId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public LocalDateTime getBannedUntil() {
        return bannedUntil;
    }
}
