package com.raghav.rupaliconstbackend.service.impl;

import com.raghav.rupaliconstbackend.DTO.AdminCreateDTO;
import com.raghav.rupaliconstbackend.DTO.AdminResponseDTO;
import com.raghav.rupaliconstbackend.DTO.DashboardDTO;
import com.raghav.rupaliconstbackend.Repositories.PropertyRepository;
import com.raghav.rupaliconstbackend.Repositories.PurchaseRepository;
import com.raghav.rupaliconstbackend.Repositories.RentalRepository;
import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.Role;
import com.raghav.rupaliconstbackend.entity.User;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PurchaseRepository purchaseRepository;
    private final RentalRepository rentalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AdminResponseDTO createAdmin(AdminCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.ADMIN);
        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Override
    public List<AdminResponseDTO> listAdmins() {
        return userRepository.findAllByRole(Role.ADMIN).stream().map(this::toDto).toList();
    }

    @Override
    public void deleteAdmin(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only ADMIN accounts can be deleted here");
        }
        userRepository.delete(user);
    }

    @Override
    public DashboardDTO getDashboard() {
        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();
        long totalSold = propertyRepository.countByStatus(PropertyStatus.SOLD);
        long totalRented = propertyRepository.countByStatus(PropertyStatus.RENTED);
        BigDecimal totalSalesRevenue = purchaseRepository.sumRevenue();
        BigDecimal totalRentalIncome = rentalRepository.sumMonthlyRent();
        Long totalReactionsNullable = propertyRepository.sumTotalReactions();
        long totalReactions = totalReactionsNullable != null ? totalReactionsNullable : 0L;
        return new DashboardDTO(totalUsers, totalProperties, totalSold, totalRented, totalSalesRevenue, totalRentalIncome, totalReactions);
    }

    private AdminResponseDTO toDto(User user) {
        return new AdminResponseDTO(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}
