package com.raghav.rupaliconstbackend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseRequestDTO {
    @NotBlank
    private String buyerName;

    @NotBlank
    private String buyerPhone;

    @Positive
    private BigDecimal purchasePrice;
}
