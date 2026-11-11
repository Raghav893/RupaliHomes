package com.raghav.rupaliconstbackend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Optional floor-plan details. Area values are square feet. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyFloorPlan {
    @NotBlank
    @Size(max = 255)
    private String title;
    @NotBlank
    @Size(max = 1000)
    private String imageUrl;
    @PositiveOrZero
    private BigDecimal totalArea;
    @PositiveOrZero
    private BigDecimal carpetArea;
    @PositiveOrZero
    private Integer bedrooms;
    @PositiveOrZero
    private Integer bathrooms;
    @PositiveOrZero
    private Integer order;
}
