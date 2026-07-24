package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import com.raghav.rupaliconstbackend.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/properties")
public class PropertyController {
    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<Page<PropertyResponseDTO>> getAvailableProperties(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRent,
            @RequestParam(required = false) BigDecimal maxRent,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String propertyCategory,
            @RequestParam(required = false) @Min(0) @Max(50) Integer minBedrooms
    ) {
        String safeSort = switch (sortBy) {
            case "createdAt", "price", "rentAmount", "title" -> sortBy;
            default -> "createdAt";
        };
        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(safeSort).ascending()
                : Sort.by(safeSort).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(
                propertyService.getAvailableProperties(pageable, type, minPrice, maxPrice, minRent, maxRent,
                        location, search, propertyCategory, minBedrooms)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponseDTO> getAvailableProperty(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getAvailableProperty(id));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/react")
    public ResponseEntity<Void> reactToProperty(@PathVariable Long id) {
        propertyService.reactToProperty(id);
        return ResponseEntity.ok().build();
    }
}
