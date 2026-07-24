package com.raghav.rupaliconstbackend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BlogSubmitDTO {
    @NotBlank
    private String authorName;

    private String authorEmail;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String imageUrl;
}
