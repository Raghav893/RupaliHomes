package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.BlogStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlogResponseDTO {
    private Long id;
    private String authorName;
    private String authorEmail;
    private String title;
    private String content;
    private String imageUrl;
    private BlogStatus status;
    private String rejectionReason;
    private Instant createdAt;
    private Instant moderatedAt;
    private String moderatedByName;
}
