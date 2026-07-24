package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.DTO.NormalUserAuthResponseDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserLoginDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserRegisterDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserResponseDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserUpdateDTO;

public interface NormalUserService {
    NormalUserAuthResponseDTO register(NormalUserRegisterDTO dto);

    NormalUserAuthResponseDTO login(NormalUserLoginDTO dto);

    NormalUserResponseDTO getByEmail(String email);

    NormalUserResponseDTO updateProfile(String email, NormalUserUpdateDTO dto);
}
