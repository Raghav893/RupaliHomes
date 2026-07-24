package com.raghav.rupaliconstbackend.Repositories;

import com.raghav.rupaliconstbackend.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    @Query("select coalesce(sum(r.monthlyRent), 0) from Rental r")
    BigDecimal sumMonthlyRent();
}
