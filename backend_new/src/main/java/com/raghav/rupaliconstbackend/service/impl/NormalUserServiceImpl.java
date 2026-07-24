package com.raghav.rupaliconstbackend.service.impl;

import com.raghav.rupaliconstbackend.DTO.NormalUserAuthResponseDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserLoginDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserRegisterDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserResponseDTO;
import com.raghav.rupaliconstbackend.DTO.NormalUserUpdateDTO;
import com.raghav.rupaliconstbackend.Repositories.NormalUserRepository;
import com.raghav.rupaliconstbackend.entity.NormalUser;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.service.NormalUserJwtService;
import com.raghav.rupaliconstbackend.service.NormalUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NormalUserServiceImpl implements NormalUserService {
    private final NormalUserRepository normalUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final NormalUserJwtService normalUserJwtService;

    @Override
    @Transactional
    public NormalUserAuthResponseDTO register(NormalUserRegisterDTO dto) {
        String email = dto.getEmail().trim().toLowerCase();
        String phone = normalizePhone(dto.getPhone());

        if (normalUserRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }
        if (normalUserRepository.existsByPhone(phone)) {
            throw new BadRequestException("An account with this phone number already exists.");
        }
        if (!dto.isPhoneVerified() || dto.getFirebaseUid() == null || dto.getFirebaseUid().isBlank()) {
            throw new BadRequestException("Please verify your phone number with OTP before signing up.");
        }

        NormalUser user = new NormalUser();
        user.setName(dto.getName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhoneVerified(true);
        user.setPhoneVerifiedAt(Instant.now());
        user.setFirebaseUid(dto.getFirebaseUid());

        NormalUser saved = normalUserRepository.save(user);
        return new NormalUserAuthResponseDTO(normalUserJwtService.generateToken(saved), toDto(saved));
    }

    @Override
    public NormalUserAuthResponseDTO login(NormalUserLoginDTO dto) {
        String email = dto.getEmail().trim().toLowerCase();
        NormalUser user = normalUserRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(dto.getPassword(), u.getPassword()))
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));
        return new NormalUserAuthResponseDTO(normalUserJwtService.generateToken(user), toDto(user));
    }

    @Override
    public NormalUserResponseDTO getByEmail(String email) {
        return toDto(findByEmailOrThrow(email));
    }

    @Override
    @Transactional
    public NormalUserResponseDTO updateProfile(String email, NormalUserUpdateDTO dto) {
        NormalUser user = findByEmailOrThrow(email);

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName().trim());
        }

        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            String nextPhone = normalizePhone(dto.getPhone());
            if (!nextPhone.equals(user.getPhone())) {
                if (normalUserRepository.existsByPhone(nextPhone)) {
                    throw new BadRequestException("An account with this phone number already exists.");
                }
                // Changing the number invalidates prior verification unless the
                // client re-verifies (mirrors the frontend updateProfile logic).
                boolean verified = Boolean.TRUE.equals(dto.getPhoneVerified());
                user.setPhone(nextPhone);
                user.setPhoneVerified(verified);
                user.setPhoneVerifiedAt(verified ? Instant.now() : null);
                user.setFirebaseUid(verified ? dto.getFirebaseUid() : null);
            } else if (Boolean.TRUE.equals(dto.getPhoneVerified())) {
                user.setPhoneVerified(true);
                user.setPhoneVerifiedAt(Instant.now());
                if (dto.getFirebaseUid() != null) {
                    user.setFirebaseUid(dto.getFirebaseUid());
                }
            }
        }

        return toDto(normalUserRepository.save(user));
    }

    private NormalUser findByEmailOrThrow(String email) {
        return normalUserRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("\\D", "");
    }

    private NormalUserResponseDTO toDto(NormalUser user) {
        return new NormalUserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.isPhoneVerified(),
                user.getPhoneVerifiedAt(),
                user.getFirebaseUid(),
                user.getCreatedAt()
        );
    }
}
