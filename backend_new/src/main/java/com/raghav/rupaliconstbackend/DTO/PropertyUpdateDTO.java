package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import com.raghav.rupaliconstbackend.model.PropertyGalleryImage;
import com.raghav.rupaliconstbackend.model.PropertyFloorPlan;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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


    // Optional premium property presentation; existing media fields remain independent.
    @Size(max = 1000)
    private String coverImage;
    @Size(max = 255)
    private String tagline;
    @Size(max = 255)
    private String eyebrow;
    @Size(max = 255)
    private String developerName;
    @Size(max = 1000)
    private String developerLogo;
    @Size(max = 255)
    private String projectStatus;
    @Pattern(regexp = "#[0-9a-fA-F]{6}", message = "Accent color must be a six-digit hex color")
    private String accentColor;
    @Pattern(regexp = "#[0-9a-fA-F]{6}", message = "Theme color must be a six-digit hex color")
    private String themeDark;
    @Pattern(regexp = "#[0-9a-fA-F]{6}", message = "Theme color must be a six-digit hex color")
    private String themeDarker;
    @Pattern(regexp = "#[0-9a-fA-F]{6}", message = "Theme color must be a six-digit hex color")
    private String themeLight;
    @Size(max = 255)
    private String themeName;

    @Valid
    @Size(max = 100)
    private List<@NotNull PropertyGalleryImage> galleryImages;
    @Valid
    @Size(max = 100)
    private List<@NotNull PropertyFloorPlan> floorPlans;
    @PositiveOrZero
    private Long brochureFileSize;
    @Size(max = 1000)
    private String brochureSourceUrl;
    @Size(max = 1000)
    private String brochurePreviewImage;
    @Size(max = 255)
    private String reraNumber;
    @Size(max = 4000)
    private String registrationsText;

    // Room details
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer sqft;
    private boolean featured = false;
    private boolean topProperty = false;

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
