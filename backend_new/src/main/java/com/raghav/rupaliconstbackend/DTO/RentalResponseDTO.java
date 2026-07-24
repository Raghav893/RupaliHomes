package com.raghav.rupaliconstbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RentalResponseDTO {
    private Long id;
    private Long propertyId;
    private String tenantName;
    private String tenantPhone;
    private BigDecimal monthlyRent;
    private LocalDate startDate;
    private LocalDate endDate;
}
