package com.raghav.rupaliconstbackend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RentalRequestDTO {
    @NotBlank
    private String tenantName;

    @NotBlank
    private String tenantPhone;

    @Positive
    private BigDecimal monthlyRent;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;
}
