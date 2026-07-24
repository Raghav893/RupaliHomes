package com.raghav.rupaliconstbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseResponseDTO {
    private Long id;
    private Long propertyId;
    private String buyerName;
    private String buyerPhone;
    private BigDecimal purchasePrice;
    private LocalDateTime purchaseDate;
}
