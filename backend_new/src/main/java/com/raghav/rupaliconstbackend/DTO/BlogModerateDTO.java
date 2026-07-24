package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.BlogStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BlogModerateDTO {
    @NotNull
    private BlogStatus status; // APPROVED or REJECTED

    private String rejectionReason;
}
