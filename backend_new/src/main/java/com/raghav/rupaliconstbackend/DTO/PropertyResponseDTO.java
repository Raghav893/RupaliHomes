package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyResponseDTO {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal rentAmount;
    private String location;
    private String size;
    private PropertyType type;
    private PropertyStatus status;
    private Long createdBy;
    private Instant createdAt;

    // Media
    private String imageUrl;
    private String imageGallery;
    private String brochureUrl;

    // Room details
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer sqft;
    private boolean featured;

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

    // Agent & Amenities
    private String agentName;
    private String agentPhotoUrl;
    private String amenities;
    
    // Reactions
    private Integer reactionsCount;
}
