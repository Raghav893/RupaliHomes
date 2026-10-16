package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.LandingInstagramVideoRequestDTO;
import com.raghav.rupaliconstbackend.DTO.LandingInstagramVideoResponseDTO;
import com.raghav.rupaliconstbackend.entity.LandingInstagramVideo;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.LandingInstagramVideoRepository;
import com.raghav.rupaliconstbackend.tools.VideoEmbedUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LandingInstagramVideoController {
    private final LandingInstagramVideoRepository repository;

    @GetMapping("/landing-instagram-videos")
    public List<LandingInstagramVideoResponseDTO> getPublished() {
        return repository.findAllByIsPublishedTrueOrderByDisplayOrderAscCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    @GetMapping("/admin/landing-instagram-videos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<LandingInstagramVideoResponseDTO> getAll() {
        return repository.findAllByOrderByDisplayOrderAscCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    @PostMapping("/admin/landing-instagram-videos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<LandingInstagramVideoResponseDTO> create(@Valid @RequestBody LandingInstagramVideoRequestDTO dto) {
        VideoEmbedUtil.ParsedVideoInfo parsed = parseInstagram(dto.getVideoUrl());
        LandingInstagramVideo video = new LandingInstagramVideo();
        apply(video, dto, parsed);
        return new ResponseEntity<>(toDto(repository.save(video)), HttpStatus.CREATED);
    }

    @PutMapping("/admin/landing-instagram-videos/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public LandingInstagramVideoResponseDTO update(@PathVariable Long id, @Valid @RequestBody LandingInstagramVideoRequestDTO dto) {
        LandingInstagramVideo video = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Landing Instagram video not found"));
        apply(video, dto, parseInstagram(dto.getVideoUrl()));
        return toDto(repository.save(video));
    }

    @DeleteMapping("/admin/landing-instagram-videos/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResourceNotFoundException("Landing Instagram video not found");
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/landing-instagram-videos/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public LandingInstagramVideoResponseDTO publish(@PathVariable Long id, @RequestParam boolean published) {
        LandingInstagramVideo video = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Landing Instagram video not found"));
        video.setIsPublished(published);
        return toDto(repository.save(video));
    }

    private VideoEmbedUtil.ParsedVideoInfo parseInstagram(String url) {
        VideoEmbedUtil.ParsedVideoInfo parsed = VideoEmbedUtil.parseAndValidate(url);
        if (!"INSTAGRAM".equals(parsed.getPlatform())) {
            throw new IllegalArgumentException("Only Instagram URLs are allowed");
        }
        return parsed;
    }

    private void apply(LandingInstagramVideo video, LandingInstagramVideoRequestDTO dto, VideoEmbedUtil.ParsedVideoInfo parsed) {
        video.setVideoUrl(parsed.getCanonicalUrl());
        video.setEmbedId(parsed.getEmbedId());
        video.setDisplayOrder(dto.getDisplayOrder() == null ? 0 : dto.getDisplayOrder());
        video.setIsPublished(dto.getIsPublished() == null || dto.getIsPublished());
    }

    private LandingInstagramVideoResponseDTO toDto(LandingInstagramVideo video) {
        return LandingInstagramVideoResponseDTO.builder()
                .id(video.getId()).videoUrl(video.getVideoUrl()).embedId(video.getEmbedId())
                .embedUrl("https://www.instagram.com/p/" + video.getEmbedId() + "/")
                .displayOrder(video.getDisplayOrder()).isPublished(video.getIsPublished())
                .createdAt(video.getCreatedAt()).updatedAt(video.getUpdatedAt()).build();
    }
}
