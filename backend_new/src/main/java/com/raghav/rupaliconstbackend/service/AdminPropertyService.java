package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.DTO.PropertyCreateDTO;
import com.raghav.rupaliconstbackend.DTO.PropertyResponseDTO;
import com.raghav.rupaliconstbackend.DTO.PropertyUpdateDTO;
import com.raghav.rupaliconstbackend.DTO.PurchaseRequestDTO;
import com.raghav.rupaliconstbackend.DTO.PurchaseResponseDTO;
import com.raghav.rupaliconstbackend.DTO.RentalRequestDTO;
import com.raghav.rupaliconstbackend.DTO.RentalResponseDTO;

import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface AdminPropertyService {
    PropertyResponseDTO createProperty(PropertyCreateDTO dto, String adminEmail);

    com.raghav.rupaliconstbackend.DTO.BulkPropertyUploadResponse bulkUploadProperties(
            MultipartFile file, String adminEmail);

    PropertyResponseDTO updateProperty(Long id, PropertyUpdateDTO dto);

    void deleteProperty(Long id, String callerEmail);

    PurchaseResponseDTO purchaseProperty(Long id, PurchaseRequestDTO dto, String adminEmail);

    RentalResponseDTO rentProperty(Long id, RentalRequestDTO dto, String adminEmail);

    org.springframework.data.domain.Page<PropertyResponseDTO> getAllProperties(org.springframework.data.domain.Pageable pageable);

    PropertyResponseDTO getPropertyById(Long id);
}
