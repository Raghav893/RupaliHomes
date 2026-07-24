package com.raghav.rupaliconstbackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DashboardDTO {
    private long totalUsers;
    private long totalProperties;
    private long totalSoldProperties;
    private long totalRentedProperties;
    private BigDecimal totalSalesRevenue;
    private BigDecimal totalRentalIncome;
    private long totalReactions;
}
