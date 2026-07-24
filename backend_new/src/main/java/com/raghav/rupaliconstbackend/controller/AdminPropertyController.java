package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.PropertyCreateDTO;
import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.DTO.PropertyUpdateDTO;
import com.raghav.rupaliconstbackend.DTO.BulkPropertyUploadResponse;
import com.raghav.rupaliconstbackend.DTO.PurchaseRequestDTO;
import com.raghav.rupaliconstbackend.DTO.PurchaseResponseDTO;
import com.raghav.rupaliconstbackend.DTO.RentalRequestDTO;
import com.raghav.rupaliconstbackend.DTO.RentalResponseDTO;
import com.raghav.rupaliconstbackend.service.AdminPropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/properties")
public class AdminPropertyController {
    private final AdminPropertyService adminPropertyService;

    @PostMapping
    public ResponseEntity<PropertyResponseDTO> createProperty(
            @Valid @RequestBody PropertyCreateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return new ResponseEntity<>(
                adminPropertyService.createProperty(dto, userDetails.getUsername()),
                HttpStatus.CREATED
        );
    }

    @PostMapping(value = "/bulk-upload", consumes = "multipart/form-data")
    public ResponseEntity<BulkPropertyUploadResponse> bulkUploadProperties(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(adminPropertyService.bulkUploadProperties(file, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<Page<PropertyResponseDTO>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(adminPropertyService.getAllProperties(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponseDTO> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(adminPropertyService.getPropertyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponseDTO> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyUpdateDTO dto
    ) {
        return ResponseEntity.ok(adminPropertyService.updateProperty(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        adminPropertyService.deleteProperty(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/purchase")
    public ResponseEntity<PurchaseResponseDTO> purchaseProperty(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(adminPropertyService.purchaseProperty(id, dto, userDetails.getUsername()));
    }

    @PostMapping("/{id}/rent")
    public ResponseEntity<RentalResponseDTO> rentProperty(
            @PathVariable Long id,
            @Valid @RequestBody RentalRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(adminPropertyService.rentProperty(id, dto, userDetails.getUsername()));
    }
}
