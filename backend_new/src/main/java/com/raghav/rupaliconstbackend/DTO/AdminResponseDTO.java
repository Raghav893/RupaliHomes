package com.raghav.rupaliconstbackend.DTO;

import com.raghav.rupaliconstbackend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Instant createdAt;
}
