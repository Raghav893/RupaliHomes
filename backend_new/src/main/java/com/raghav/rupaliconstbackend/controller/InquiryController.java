package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.entity.Inquiry;
import com.raghav.rupaliconstbackend.entity.Role;
import com.raghav.rupaliconstbackend.entity.User;
import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    // ── Public: Submit inquiry (no auth required) ─────────
    @PostMapping("/inquiries")
    public ResponseEntity<Inquiry> submitInquiry(@RequestBody Inquiry inquiry) {
        inquiry.setCreatedAt(LocalDateTime.now());
        if (inquiry.getStatus() == null || inquiry.getStatus().isEmpty()) {
            inquiry.setStatus("NEW");
        }
        Inquiry saved = inquiryRepository.save(inquiry);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ── Admin: List all inquiries (both ADMIN and SUPER_ADMIN) ─
    @GetMapping("/admin/inquiries")
    public ResponseEntity<List<Inquiry>> getAllInquiries() {
        return ResponseEntity.ok(inquiryRepository.findAllByOrderByCreatedAtDesc());
    }

    // ── Admin: Get single inquiry ─────────────────────────
    @GetMapping("/admin/inquiries/{id}")
    public ResponseEntity<Inquiry> getInquiry(@PathVariable Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));
        return ResponseEntity.ok(inquiry);
    }

    // ── Admin: Update inquiry status (both ADMIN and SUPER_ADMIN) ─
    @PutMapping("/admin/inquiries/{id}/status")
    public ResponseEntity<Inquiry> updateInquiryStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body
    ) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required");
        }
        inquiry.setStatus(status.toUpperCase());
        return ResponseEntity.ok(inquiryRepository.save(inquiry));
    }

    // ── SUPER_ADMIN only: Delete inquiry ──────────────────
    @DeleteMapping("/admin/inquiries/{id}")
    public ResponseEntity<Void> deleteInquiry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Verify the caller is SUPER_ADMIN
        User caller = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (caller.getRole() != Role.SUPER_ADMIN) {
            throw new BadRequestException("Only Super Admins can delete inquiries");
        }

        if (!inquiryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inquiry not found");
        }
        inquiryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
