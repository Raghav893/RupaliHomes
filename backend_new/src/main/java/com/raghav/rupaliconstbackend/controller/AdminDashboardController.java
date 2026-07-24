package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.DashboardDTO;
import com.raghav.rupaliconstbackend.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {
    private final SuperAdminService superAdminService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(superAdminService.getDashboard());
    }
}
