package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.TestimonialResponseDTO;
import com.raghav.rupaliconstbackend.entity.Testimonial;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/testimonials")
public class TestimonialController {

    private final TestimonialRepository testimonialRepository;

    @GetMapping
    public ResponseEntity<List<TestimonialResponseDTO>> getPublishedTestimonials() {
        List<TestimonialResponseDTO> list = testimonialRepository
                .findAllByIsPublishedTrueOrderByDisplayOrderAscCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestimonialResponseDTO> getPublishedTestimonial(@PathVariable Long id) {
        Testimonial testimonial = testimonialRepository.findByIdAndIsPublishedTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial not found"));
        return ResponseEntity.ok(toDto(testimonial));
    }

    public TestimonialResponseDTO toDto(Testimonial entity) {
        String embedUrl = null;
        String resolvedThumbnailUrl = entity.getThumbnailUrl();

        if ("YOUTUBE".equalsIgnoreCase(entity.getVideoPlatform())) {
            if (entity.getEmbedId() != null) {
                embedUrl = "https://www.youtube-nocookie.com/embed/" + entity.getEmbedId();
                if (resolvedThumbnailUrl == null || resolvedThumbnailUrl.isBlank()) {
                    resolvedThumbnailUrl = "https://img.youtube.com/vi/" + entity.getEmbedId() + "/hqdefault.jpg";
                }
            }
        } else if ("INSTAGRAM".equalsIgnoreCase(entity.getVideoPlatform())) {
            if (entity.getEmbedId() != null) {
                embedUrl = "https://www.instagram.com/p/" + entity.getEmbedId() + "/";
            }
        }

        return TestimonialResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .videoUrl(entity.getVideoUrl())
                .thumbnailUrl(resolvedThumbnailUrl)
                .familyName(entity.getFamilyName())
                .propertyReference(entity.getPropertyReference())
                .displayOrder(entity.getDisplayOrder() != null ? entity.getDisplayOrder() : 0)
                .isPublished(entity.getIsPublished() != null ? entity.getIsPublished() : true)
                .videoPlatform(entity.getVideoPlatform())
                .embedId(entity.getEmbedId())
                .embedUrl(embedUrl)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
