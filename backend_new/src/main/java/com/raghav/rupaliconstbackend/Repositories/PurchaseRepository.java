package com.raghav.rupaliconstbackend.Repositories;

import com.raghav.rupaliconstbackend.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    @Query("select coalesce(sum(p.purchasePrice), 0) from Purchase p")
    BigDecimal sumRevenue();
}
