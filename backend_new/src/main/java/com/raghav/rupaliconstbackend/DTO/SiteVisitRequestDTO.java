package com.raghav.rupaliconstbackend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SiteVisitRequestDTO {
    @NotNull
    private Long propertyId;

    @NotBlank
    private String visitorName;

    @NotBlank
    private String visitorPhone;

    private String visitorEmail;

    @NotNull
    private LocalDate preferredDate;

    private String preferredTime;

    private String message;
}
