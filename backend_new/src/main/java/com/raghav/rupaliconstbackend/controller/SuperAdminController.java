package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.AdminCreateDTO;
import com.raghav.rupaliconstbackend.DTO.AdminResponseDTO;
import com.raghav.rupaliconstbackend.DTO.DashboardDTO;
import com.raghav.rupaliconstbackend.service.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/super-admin")
public class SuperAdminController {
    private final SuperAdminService superAdminService;

    @PostMapping("/admins")
    public ResponseEntity<AdminResponseDTO> createAdmin(@Valid @RequestBody AdminCreateDTO dto) {
        return new ResponseEntity<>(superAdminService.createAdmin(dto), HttpStatus.CREATED);
    }

    @GetMapping("/admins")
    public ResponseEntity<List<AdminResponseDTO>> listAdmins() {
        return ResponseEntity.ok(superAdminService.listAdmins());
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        superAdminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(superAdminService.getDashboard());
    }
}
