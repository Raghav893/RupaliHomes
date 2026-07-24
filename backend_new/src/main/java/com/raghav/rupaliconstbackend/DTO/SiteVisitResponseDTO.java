package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.VisitStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SiteVisitResponseDTO {
    private Long id;
    private Long propertyId;
    private String visitorName;
    private String visitorPhone;
    private String visitorEmail;
    private LocalDate preferredDate;
    private String preferredTime;
    private String message;
    private VisitStatus status;
    private Instant createdAt;
}
