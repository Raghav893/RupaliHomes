package com.raghav.rupaliconstbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String familyName;
    private String propertyReference;
    private Integer displayOrder;
    private Boolean isPublished;
    private String videoPlatform; // "YOUTUBE" or "INSTAGRAM"
    private String embedId;
    private String embedUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
