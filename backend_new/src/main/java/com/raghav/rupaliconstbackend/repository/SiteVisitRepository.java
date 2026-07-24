package com.raghav.rupaliconstbackend.repository;

import com.raghav.rupaliconstbackend.entity.SiteVisit;
import com.raghav.rupaliconstbackend.entity.VisitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteVisitRepository extends JpaRepository<SiteVisit, Long> {
    boolean existsByVisitorPhoneAndPropertyIdAndStatus(String visitorPhone, Long propertyId, VisitStatus status);

    Page<SiteVisit> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
