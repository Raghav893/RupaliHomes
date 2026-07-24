package com.raghav.rupaliconstbackend.Repositories;

import com.raghav.rupaliconstbackend.entity.NormalUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NormalUserRepository extends JpaRepository<NormalUser, Long> {
    Optional<NormalUser> findByEmail(String email);

    Optional<NormalUser> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
