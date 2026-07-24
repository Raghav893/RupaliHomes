package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface PropertyService {
    Page<PropertyResponseDTO> getAvailableProperties(
            Pageable pageable,
            PropertyType type,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRent,
            BigDecimal maxRent,
            String location,
            String search,
            String propertyCategory,
            Integer minBedrooms
    );
    PropertyResponseDTO getAvailableProperty(Long id);

    void reactToProperty(Long id);
}
