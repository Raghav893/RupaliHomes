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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {
    private final PropertyRepository propertyRepository;
    private final PropertyLikeRepository propertyLikeRepository;

    @Override
    public Page<PropertyResponseDTO> getAvailableProperties(Pageable pageable, PropertyType type, BigDecimal minPrice,
                                                            BigDecimal maxPrice, BigDecimal minRent, BigDecimal maxRent,
                                                            String location, String search, String propertyCategory,
                                                            Integer minBedrooms) {
        Specification<Property> spec =
                (root, query, cb) -> cb.equal(root.get("status"), PropertyStatus.AVAILABLE);

        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }
        if (location != null && !location.isBlank()) {
            String locationLower = "%" + escapeLike(location) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("location")), locationLower, '\\'),
                    cb.like(cb.lower(root.get("city")), locationLower, '\\'),
                    cb.like(cb.lower(root.get("microMarket")), locationLower, '\\'),
                    cb.like(cb.lower(root.get("locality")), locationLower, '\\')));
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

        return propertyRepository.findAll(spec, pageable).map(this::toDto);
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
        Property property = propertyRepository.findByIdAndStatus(id, PropertyStatus.AVAILABLE)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        return toDto(property);
    }

    @Override
    public void reactToProperty(Long id) {
        Property property = propertyRepository.findByIdAndStatus(id, PropertyStatus.AVAILABLE)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        
        Integer current = property.getReactionsCount();
        if (current == null) current = 0;
        property.setReactionsCount(current + 1);
        propertyRepository.save(property);
    }

    private PropertyResponseDTO toDto(Property property) {
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
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setSqft(property.getSqft());
        dto.setFeatured(property.isFeatured());
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
        // Use real count from property_likes table for accuracy (#16)
        long realCount = propertyLikeRepository.countByPropertyId(property.getId());
        dto.setReactionsCount((int) realCount);
        return dto;
    }
}
