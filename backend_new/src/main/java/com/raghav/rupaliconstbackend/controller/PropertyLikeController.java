package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.entity.PropertyLike;
import com.raghav.rupaliconstbackend.entity.Property;
import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.Repositories.PropertyRepository;
import com.raghav.rupaliconstbackend.repository.PropertyLikeRepository;
import com.raghav.rupaliconstbackend.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/likes")
public class PropertyLikeController {

    private final PropertyLikeRepository propertyLikeRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;

    // Like a property
    @PostMapping("/{propertyId}")
    public ResponseEntity<Map<String, Object>> likeProperty(
            @PathVariable Long propertyId,
            @RequestParam String visitorId) {

        // Check if already liked
        if (propertyLikeRepository.existsByVisitorIdAndPropertyId(visitorId, propertyId)) {
            long count = propertyLikeRepository.countByPropertyId(propertyId);
            return ResponseEntity.ok(Map.of("liked", true, "message", "Already liked", "count", count));
        }

        // Save the like
        PropertyLike like = new PropertyLike();
        like.setVisitorId(visitorId);
        like.setPropertyId(propertyId);
        propertyLikeRepository.save(like);

        // Sync reactionsCount from actual COUNT
        long count = propertyLikeRepository.countByPropertyId(propertyId);
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        propertyOpt.ifPresent(property -> {
            property.setReactionsCount((int) count);
            propertyRepository.save(property);
        });

        return ResponseEntity.ok(Map.of("liked", true, "message", "Liked successfully", "count", count));
    }

    // Unlike a property
    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Map<String, Object>> unlikeProperty(
            @PathVariable Long propertyId,
            @RequestParam String visitorId) {

        Optional<PropertyLike> existing = propertyLikeRepository.findByVisitorIdAndPropertyId(visitorId, propertyId);
        if (existing.isPresent()) {
            propertyLikeRepository.delete(existing.get());

            // Sync reactionsCount from actual COUNT
            long count = propertyLikeRepository.countByPropertyId(propertyId);
            Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
            propertyOpt.ifPresent(property -> {
                property.setReactionsCount((int) count);
                propertyRepository.save(property);
            });

            return ResponseEntity.ok(Map.of("liked", false, "message", "Unliked successfully", "count", count));
        }

        long count = propertyLikeRepository.countByPropertyId(propertyId);
        return ResponseEntity.ok(Map.of("liked", false, "message", "Was not liked", "count", count));
    }

    // Get all liked property IDs for a visitor
    @GetMapping
    public ResponseEntity<List<Long>> getLikedPropertyIds(@RequestParam String visitorId) {
        List<Long> ids = propertyLikeRepository.findAllByVisitorId(visitorId)
                .stream()
                .map(PropertyLike::getPropertyId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }

    // Get full liked properties for a visitor
    @GetMapping("/properties")
    public ResponseEntity<List<PropertyResponseDTO>> getLikedProperties(@RequestParam String visitorId) {
        List<Long> ids = propertyLikeRepository.findAllByVisitorId(visitorId)
                .stream()
                .map(PropertyLike::getPropertyId)
                .collect(Collectors.toList());

        if (ids.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<PropertyResponseDTO> properties = ids.stream()
                .map(id -> {
                    try {
                        return propertyService.getAvailableProperty(id);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(p -> p != null)
                .collect(Collectors.toList());

        return ResponseEntity.ok(properties);
    }
}
