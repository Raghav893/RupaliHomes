package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.DTO.AdminCreateDTO;
import com.raghav.rupaliconstbackend.DTO.AdminResponseDTO;
import com.raghav.rupaliconstbackend.DTO.DashboardDTO;

import java.util.List;

public interface SuperAdminService {
    AdminResponseDTO createAdmin(AdminCreateDTO dto);

    List<AdminResponseDTO> listAdmins();

    void deleteAdmin(Long id);

    DashboardDTO getDashboard();
}
