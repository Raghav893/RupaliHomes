package com.raghav.rupaliconstbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Safe view of a NormalUser (never exposes the password hash). Field names match
 * the frontend Account interface so the JSON maps one-to-one.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NormalUserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private boolean phoneVerified;
    private Instant phoneVerifiedAt;
    private String firebaseUid;
    private Instant createdAt;
}
