package com.raghav.rupaliconstbackend.DTO;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class LandingInstagramVideoResponseDTO {
    Long id;
    String videoUrl;
    String embedId;
    String embedUrl;
    Integer displayOrder;
    Boolean isPublished;
    Instant createdAt;
    Instant updatedAt;
}
