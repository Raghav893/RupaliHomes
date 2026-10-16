package com.raghav.rupaliconstbackend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Video URL is required")
    private String videoUrl;

    private String thumbnailUrl;

    private String familyName;

    private String propertyReference;

    private Integer displayOrder = 0;

    private Boolean isPublished = true;
}
