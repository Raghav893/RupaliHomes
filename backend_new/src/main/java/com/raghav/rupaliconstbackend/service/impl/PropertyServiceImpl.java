package com.raghav.rupaliconstbackend.service.impl;

import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.Repositories.PropertyRepository;
import com.raghav.rupaliconstbackend.entity.Property;
import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.PropertyLikeRepository;
import com.raghav.rupaliconstbackend.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {
    private final PropertyRepository propertyRepository;
    private final PropertyLikeRepository propertyLikeRepository;

    @Override
    public Page<PropertyResponseDTO> getAvailableProperties(Pageable pageable, PropertyType type, PropertyStatus status,
                                                            BigDecimal minPrice, BigDecimal maxPrice, BigDecimal minRent,
                                                            BigDecimal maxRent, String location, String search,
                                                            String propertyCategory, Integer minBedrooms, String city, Boolean featured, Boolean topProperty, String tag) {
        PropertyStatus effectiveStatus = status != null ? status : PropertyStatus.AVAILABLE;
        Specification<Property> spec =
                (root, query, cb) -> cb.equal(root.get("status"), effectiveStatus);

        if (tag != null && !tag.isBlank()) {
            String tagPattern = "%," + escapeLike(tag).replace(" ", "") + ",%";
            spec = spec.and((root, query, cb) -> cb.like(
                cb.concat(cb.concat(",", cb.function("replace", String.class, cb.lower(root.get("tags")), cb.literal(" "), cb.literal(""))), ","), tagPattern, '\\'));
        }
        if (featured != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("featured"), featured));
        if (topProperty != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("topProperty"), topProperty));
        if (city != null && !city.isBlank()) {
            if (city.equalsIgnoreCase("Gurugram") || city.equalsIgnoreCase("Gurgaon")) {
                spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("city")), "%gurgaon%"), cb.like(cb.lower(root.get("city")), "%gurugram%"),
                    cb.like(cb.lower(root.get("location")), "%gurgaon%"), cb.like(cb.lower(root.get("location")), "%gurugram%")));
            } else {
                String cityPattern = "%" + escapeLike(city) + "%";
                spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("city")), cityPattern, '\\'));
            }
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }
        if (location != null && !location.isBlank()) {
            String locationLower = "% " + escapeLike(normalizeLocation(location)) + " %";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.concat(cb.concat(" ", normalizeLocation(cb, root.get("location"))), " "), locationLower, '\\'),
                    cb.like(cb.concat(cb.concat(" ", normalizeLocation(cb, root.get("city"))), " "), locationLower, '\\'),
                    cb.like(cb.concat(cb.concat(" ", normalizeLocation(cb, root.get("microMarket"))), " "), locationLower, '\\'),
                    cb.like(cb.concat(cb.concat(" ", normalizeLocation(cb, root.get("locality"))), " "), locationLower, '\\')));
        }
        if (search != null && !search.isBlank()) {
            String searchLower = "%" + escapeLike(search) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), searchLower, '\\'),
                    cb.like(cb.lower(root.get("description")), searchLower, '\\'),
                    cb.like(cb.lower(root.get("location")), searchLower, '\\'),
                    cb.like(cb.lower(root.get("city")), searchLower, '\\'),
                    cb.like(cb.lower(root.get("locality")), searchLower, '\\'),
                    cb.like(cb.lower(root.get("propertyCategory")), searchLower, '\\'),
                    cb.like(cb.lower(root.get("tags")), searchLower, '\\')));
        }
        if (propertyCategory != null && !propertyCategory.isBlank() && !"Any Type".equalsIgnoreCase(propertyCategory)) {
            String category = "%" + escapeLike(propertyCategory) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("propertyCategory")), category, '\\'),
                    cb.like(cb.lower(root.get("buildingType")), category, '\\')));
        }
        if (minBedrooms != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("bedrooms"), minBedrooms));
        }
        BigDecimal effectiveMinPrice = type == PropertyType.RENT ? minRentOr(minPrice, minRent) : minPrice;
        BigDecimal effectiveMaxPrice = type == PropertyType.RENT ? maxRentOr(maxPrice, maxRent) : maxPrice;
        if (effectiveMinPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get(type == PropertyType.RENT ? "rentAmount" : "price"), effectiveMinPrice));
        }
        if (effectiveMaxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get(type == PropertyType.RENT ? "rentAmount" : "price"), effectiveMaxPrice));
        }

        Page<Property> properties = propertyRepository.findAll(spec, pageable);
        if (properties.isEmpty()) {
            return properties.map(property -> toDto(property, 0));
        }
        List<Long> propertyIds = properties.getContent().stream().map(Property::getId).toList();
        Map<Long, Long> likeCounts = propertyLikeRepository.countLikesByPropertyIds(propertyIds).stream()
                .collect(Collectors.toMap(PropertyLikeRepository.PropertyLikeCount::getPropertyId,
                        PropertyLikeRepository.PropertyLikeCount::getLikeCount));
        return properties.map(property -> toDto(property, likeCounts.getOrDefault(property.getId(), 0L)));
    }

    private static String normalizeLocation(String value) {
        String normalized = value.toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9]+", " ").replace("gurgaon", "gurugram").trim();
        String[] phases = {"i", "ii", "iii", "iv", "v"};
        for (int index = 0; index < phases.length; index++) normalized = normalized.replaceAll("\\bphase " + phases[index] + "\\b", "phase " + (index + 1));
        return normalized;
    }

    private static Expression<String> normalizeLocation(CriteriaBuilder cb, Expression<String> value) {
        Expression<String> normalized = cb.function("regexp_replace", String.class, cb.lower(value), cb.literal("[^a-z0-9]+"), cb.literal(" "), cb.literal("g"));
        normalized = cb.function("replace", String.class, normalized, cb.literal("gurgaon"), cb.literal("gurugram"));
        String[] phases = {"i", "ii", "iii", "iv", "v"};
        for (int index = 0; index < phases.length; index++) normalized = cb.function("regexp_replace", String.class, normalized, cb.literal("\\mphase " + phases[index] + "\\M"), cb.literal("phase " + (index + 1)), cb.literal("g"));
        return normalized;
    }

    private static BigDecimal minRentOr(BigDecimal minPrice, BigDecimal minRent) {
        return minPrice != null ? minPrice : minRent;
    }

    private static BigDecimal maxRentOr(BigDecimal maxPrice, BigDecimal maxRent) {
        return maxPrice != null ? maxPrice : maxRent;
    }

    private static String escapeLike(String value) {
        return value.trim().toLowerCase().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    @Override
    public PropertyResponseDTO getAvailableProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        if (property.getStatus() == PropertyStatus.HIDDEN) {
            throw new ResourceNotFoundException("Property not found");
        }
        return toDto(property, propertyLikeRepository.countByPropertyId(property.getId()));
    }

    @Override
    public void reactToProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        if (property.getStatus() == PropertyStatus.HIDDEN) {
            throw new ResourceNotFoundException("Property not found");
        }
        
        Integer current = property.getReactionsCount();
        if (current == null) current = 0;
        property.setReactionsCount(current + 1);
        propertyRepository.save(property);
    }

    private PropertyResponseDTO toDto(Property property, long likeCount) {
        PropertyResponseDTO dto = new PropertyResponseDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setPrice(property.getPrice());
        dto.setRentAmount(property.getRentAmount());
        dto.setLocation(property.getLocation());
        dto.setSize(property.getSize());
        dto.setType(property.getType());
        dto.setStatus(property.getStatus());
        dto.setCreatedBy(property.getCreatedBy() == null ? null : property.getCreatedBy().getId());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setImageUrl(property.getImageUrl());
        dto.setImageGallery(property.getImageGallery());
        dto.setBrochureUrl(property.getBrochureUrl());
        dto.setCoverImage(property.getCoverImage());
        dto.setTagline(property.getTagline());
        dto.setEyebrow(property.getEyebrow());
        dto.setDeveloperName(property.getDeveloperName());
        dto.setDeveloperLogo(property.getDeveloperLogo());
        dto.setProjectStatus(property.getProjectStatus());
        dto.setAccentColor(property.getAccentColor());
        dto.setThemeDark(property.getThemeDark());
        dto.setThemeDarker(property.getThemeDarker());
        dto.setThemeLight(property.getThemeLight());
        dto.setThemeName(property.getThemeName());
        dto.setGalleryImages(property.getGalleryImages());
        dto.setFloorPlans(property.getFloorPlans());
        dto.setBrochureFileSize(property.getBrochureFileSize());
        dto.setBrochureSourceUrl(property.getBrochureSourceUrl());
        dto.setBrochurePreviewImage(property.getBrochurePreviewImage());
        dto.setReraNumber(property.getReraNumber());
        dto.setRegistrationsText(property.getRegistrationsText());
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setSqft(property.getSqft());
        dto.setFeatured(property.isFeatured());
        dto.setTopProperty(property.isTopProperty());
        dto.setBuildingType(property.getBuildingType());
        dto.setPropertyCategory(property.getPropertyCategory());
        dto.setCity(property.getCity());
        dto.setMicroMarket(property.getMicroMarket());
        dto.setLocality(property.getLocality());
        dto.setFlooring(property.getFlooring());
        dto.setFloorNumber(property.getFloorNumber());
        dto.setTotalFloors(property.getTotalFloors());
        dto.setUnitNumber(property.getUnitNumber());
        dto.setAvailableFrom(property.getAvailableFrom());
        dto.setTags(property.getTags());
        dto.setFurnishingDetails(property.getFurnishingDetails());
        dto.setFurnishingStatus(property.getFurnishingStatus());
        dto.setAgentName(property.getAgentName());
        dto.setAgentPhotoUrl(property.getAgentPhotoUrl());
        dto.setAmenities(property.getAmenities());
        dto.setReactionsCount((int) likeCount);
        return dto;
    }
}
