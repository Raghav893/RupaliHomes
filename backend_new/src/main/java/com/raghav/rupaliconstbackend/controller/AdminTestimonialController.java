package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.TestimonialRequestDTO;
import com.raghav.rupaliconstbackend.DTO.TestimonialResponseDTO;
import com.raghav.rupaliconstbackend.entity.Testimonial;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.TestimonialRepository;
import com.raghav.rupaliconstbackend.tools.VideoEmbedUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/testimonials")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminTestimonialController {

    private final TestimonialRepository testimonialRepository;
    private final TestimonialController testimonialController;

    @GetMapping
    public ResponseEntity<List<TestimonialResponseDTO>> getAllTestimonials() {
        List<TestimonialResponseDTO> list = testimonialRepository
                .findAllByOrderByDisplayOrderAscCreatedAtDesc()
                .stream()
                .map(testimonialController::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestimonialResponseDTO> getTestimonial(@PathVariable Long id) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial not found with id: " + id));
        return ResponseEntity.ok(testimonialController.toDto(testimonial));
    }

    @PostMapping
    public ResponseEntity<TestimonialResponseDTO> createTestimonial(@Valid @RequestBody TestimonialRequestDTO dto) {
        VideoEmbedUtil.ParsedVideoInfo parsed = VideoEmbedUtil.parseAndValidate(dto.getVideoUrl());

        Testimonial testimonial = new Testimonial();
        testimonial.setTitle(dto.getTitle().trim());
        testimonial.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        testimonial.setVideoUrl(dto.getVideoUrl().trim());
        testimonial.setThumbnailUrl(dto.getThumbnailUrl() != null ? dto.getThumbnailUrl().trim() : null);
        testimonial.setFamilyName(dto.getFamilyName() != null ? dto.getFamilyName().trim() : null);
        testimonial.setPropertyReference(dto.getPropertyReference() != null ? dto.getPropertyReference().trim() : null);
        testimonial.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        testimonial.setIsPublished(dto.getIsPublished() != null ? dto.getIsPublished() : true);
        testimonial.setVideoPlatform(parsed.getPlatform());
        testimonial.setEmbedId(parsed.getEmbedId());
        testimonial.setCreatedAt(Instant.now());
        testimonial.setUpdatedAt(Instant.now());

        Testimonial saved = testimonialRepository.save(testimonial);
        return new ResponseEntity<>(testimonialController.toDto(saved), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestimonialResponseDTO> updateTestimonial(
            @PathVariable Long id,
            @Valid @RequestBody TestimonialRequestDTO dto
    ) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial not found with id: " + id));

        VideoEmbedUtil.ParsedVideoInfo parsed = VideoEmbedUtil.parseAndValidate(dto.getVideoUrl());

        testimonial.setTitle(dto.getTitle().trim());
        testimonial.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        testimonial.setVideoUrl(dto.getVideoUrl().trim());
        testimonial.setThumbnailUrl(dto.getThumbnailUrl() != null ? dto.getThumbnailUrl().trim() : null);
        testimonial.setFamilyName(dto.getFamilyName() != null ? dto.getFamilyName().trim() : null);
        testimonial.setPropertyReference(dto.getPropertyReference() != null ? dto.getPropertyReference().trim() : null);
        testimonial.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        testimonial.setIsPublished(dto.getIsPublished() != null ? dto.getIsPublished() : true);
        testimonial.setVideoPlatform(parsed.getPlatform());
        testimonial.setEmbedId(parsed.getEmbedId());
        testimonial.setUpdatedAt(Instant.now());

        Testimonial saved = testimonialRepository.save(testimonial);
        return ResponseEntity.ok(testimonialController.toDto(saved));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<TestimonialResponseDTO> togglePublish(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean published
    ) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial not found with id: " + id));

        if (published != null) {
            testimonial.setIsPublished(published);
        } else {
            testimonial.setIsPublished(!Boolean.TRUE.equals(testimonial.getIsPublished()));
        }
        testimonial.setUpdatedAt(Instant.now());

        Testimonial saved = testimonialRepository.save(testimonial);
        return ResponseEntity.ok(testimonialController.toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable Long id) {
        if (!testimonialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Testimonial not found with id: " + id);
        }
        testimonialRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
