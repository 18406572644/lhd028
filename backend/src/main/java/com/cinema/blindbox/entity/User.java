package com.cinema.blindbox.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "`user`")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String nickname;

    @Column(length = 500)
    private String avatar;

    @Column(length = 200)
    private String favoriteGenres;

    @Column(name = "login_attempt_count")
    private Integer loginAttemptCount = 0;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Column(name = "password_migrated")
    private Boolean passwordMigrated = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
