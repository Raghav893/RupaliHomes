package com.raghav.rupaliconstbackend.DTO;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Profile update from the account page. All fields optional — only the ones
 * provided are applied. Mirrors AuthContext.updateProfile's patch shape.
 */
@Data
public class NormalUserUpdateDTO {
    private String name;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String phone;

    private Boolean phoneVerified;

    private String firebaseUid;
}
