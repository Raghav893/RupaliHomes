package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.DTO.AuthResponseDTO;
import com.raghav.rupaliconstbackend.DTO.LoginDTO;
import com.raghav.rupaliconstbackend.DTO.RegisterDTO;

public interface AuthService {
    AuthResponseDTO register(RegisterDTO dto);

    AuthResponseDTO login(LoginDTO dto);
}
