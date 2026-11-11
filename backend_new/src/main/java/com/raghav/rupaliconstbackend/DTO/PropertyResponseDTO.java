package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import lombok.AllArgsConstructor;
import com.raghav.rupaliconstbackend.model.PropertyGalleryImage;
import com.raghav.rupaliconstbackend.model.PropertyFloorPlan;
import java.util.List;
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


    // Optional premium property presentation; existing media fields remain independent.
    private String coverImage;
    private String tagline;
    private String eyebrow;
    private String developerName;
    private String developerLogo;
    private String projectStatus;
    private String accentColor;
    private String themeDark;
    private String themeDarker;
    private String themeLight;
    private String themeName;

    private List<PropertyGalleryImage> galleryImages;
    private List<PropertyFloorPlan> floorPlans;
    private Long brochureFileSize;
    private String brochureSourceUrl;
    private String brochurePreviewImage;
    private String reraNumber;
    private String registrationsText;

    // Room details
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer sqft;
    private boolean featured;
    private boolean topProperty;

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
