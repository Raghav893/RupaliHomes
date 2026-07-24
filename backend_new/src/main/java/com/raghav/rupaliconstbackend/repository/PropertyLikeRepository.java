package com.raghav.rupaliconstbackend.repository;

import com.raghav.rupaliconstbackend.entity.PropertyLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PropertyLikeRepository extends JpaRepository<PropertyLike, Long> {
    Optional<PropertyLike> findByVisitorIdAndPropertyId(String visitorId, Long propertyId);
    List<PropertyLike> findAllByVisitorId(String visitorId);
    boolean existsByVisitorIdAndPropertyId(String visitorId, Long propertyId);
    long countByPropertyId(Long propertyId);
}
