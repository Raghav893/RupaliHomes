package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PropertyUpdateDTO {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @PositiveOrZero
    private BigDecimal price;

    @PositiveOrZero
    private BigDecimal rentAmount;

    @NotBlank
    private String location;

    private String size;

    @NotNull
    private PropertyType type;

    @NotNull
    private PropertyStatus status;

    // Media
    private String imageUrl;
    private String imageGallery;
    private String brochureUrl;

    // Room details
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer sqft;
    private boolean featured = false;

    // Extended real estate fields
    private String buildingType;
    private String propertyCategory;
    private String city;
    private String microMarket;
    private String locality;
    private String flooring;
    private Integer floorNumber;
    private Integer totalFloors;
    private Integer unitNumber;
    private String availableFrom;
    private String tags;
    private String furnishingDetails;
    private String furnishingStatus;
}
