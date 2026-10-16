package com.raghav.rupaliconstbackend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LandingInstagramVideoRequestDTO {
    @NotBlank
    private String videoUrl;
    private Integer displayOrder = 0;
    private Boolean isPublished = true;
}
