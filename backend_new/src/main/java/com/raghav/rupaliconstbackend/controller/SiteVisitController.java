package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.SiteVisitRequestDTO;
import com.raghav.rupaliconstbackend.DTO.SiteVisitResponseDTO;
import com.raghav.rupaliconstbackend.entity.SiteVisit;
import com.raghav.rupaliconstbackend.entity.VisitStatus;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.SiteVisitRepository;
import com.raghav.rupaliconstbackend.Repositories.PropertyRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SiteVisitController {

    private final SiteVisitRepository siteVisitRepository;
    private final PropertyRepository propertyRepository;

    // ── Public: Book a visit ──────────────────────────
    @PostMapping("/site-visits")
    public ResponseEntity<SiteVisitResponseDTO> bookVisit(@Valid @RequestBody SiteVisitRequestDTO dto) {
        // Verify property exists
        if (!propertyRepository.existsById(dto.getPropertyId())) {
            throw new ResourceNotFoundException("Property not found");
        }

        // Check for duplicate active booking
        if (siteVisitRepository.existsByVisitorPhoneAndPropertyIdAndStatus(
                dto.getVisitorPhone(), dto.getPropertyId(), VisitStatus.REQUESTED)) {
            throw new BadRequestException("You already have a pending visit request for this property");
        }

        SiteVisit visit = new SiteVisit();
        visit.setPropertyId(dto.getPropertyId());
        visit.setVisitorName(dto.getVisitorName());
        visit.setVisitorPhone(dto.getVisitorPhone());
        visit.setVisitorEmail(dto.getVisitorEmail());
        visit.setPreferredDate(dto.getPreferredDate());
        visit.setPreferredTime(dto.getPreferredTime());
        visit.setMessage(dto.getMessage());
        visit.setStatus(VisitStatus.REQUESTED);

        SiteVisit saved = siteVisitRepository.save(visit);
        return new ResponseEntity<>(toDto(saved), HttpStatus.CREATED);
    }

    // ── Admin: List all visits ────────────────────────
    @GetMapping("/admin/site-visits")
    public ResponseEntity<Page<SiteVisitResponseDTO>> getAllVisits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SiteVisitResponseDTO> visits = siteVisitRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDto);
        return ResponseEntity.ok(visits);
    }

    // ── Admin: Update visit status ────────────────────
    @PutMapping("/admin/site-visits/{id}/status")
    public ResponseEntity<SiteVisitResponseDTO> updateVisitStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        SiteVisit visit = siteVisitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site visit not found"));

        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            throw new BadRequestException("Status is required");
        }

        try {
            VisitStatus newStatus = VisitStatus.valueOf(statusStr.toUpperCase());
            visit.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status. Allowed: REQUESTED, CONFIRMED, COMPLETED, CANCELLED");
        }

        SiteVisit saved = siteVisitRepository.save(visit);
        return ResponseEntity.ok(toDto(saved));
    }

    private SiteVisitResponseDTO toDto(SiteVisit visit) {
        SiteVisitResponseDTO dto = new SiteVisitResponseDTO();
        dto.setId(visit.getId());
        dto.setPropertyId(visit.getPropertyId());
        dto.setVisitorName(visit.getVisitorName());
        dto.setVisitorPhone(visit.getVisitorPhone());
        dto.setVisitorEmail(visit.getVisitorEmail());
        dto.setPreferredDate(visit.getPreferredDate());
        dto.setPreferredTime(visit.getPreferredTime());
        dto.setMessage(visit.getMessage());
        dto.setStatus(visit.getStatus());
        dto.setCreatedAt(visit.getCreatedAt());
        return dto;
    }
}
