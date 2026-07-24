package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.entity.User;
import com.raghav.rupaliconstbackend.entity.UserPrincipal;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserPrincipal(user);
    }
}
