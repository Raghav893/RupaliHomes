package com.raghav.rupaliconstbackend.service.impl;

import com.raghav.rupaliconstbackend.DTO.AuthResponseDTO;
import com.raghav.rupaliconstbackend.DTO.LoginDTO;
import com.raghav.rupaliconstbackend.DTO.RegisterDTO;
import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.entity.Role;
import com.raghav.rupaliconstbackend.entity.User;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.service.AuthService;
import com.raghav.rupaliconstbackend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponseDTO register(RegisterDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.ADMIN);
        User saved = userRepository.save(user);
        return new AuthResponseDTO(jwtService.generateToken(saved));
    }

    @Override
    public AuthResponseDTO login(LoginDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new AuthResponseDTO(jwtService.generateToken(user));
    }
}
