package com.raghav.rupaliconstbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Public-visitor ("normal user") account — the customer-facing sign-up that the
 * frontend AuthContext drives. Kept entirely separate from {@link User}
 * (ADMIN / SUPER_ADMIN) so the two auth systems never collide.
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "normal_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "phone")
})
public class NormalUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean phoneVerified;

    private Instant phoneVerifiedAt;

    @Column(length = 128)
    private String firebaseUid;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
