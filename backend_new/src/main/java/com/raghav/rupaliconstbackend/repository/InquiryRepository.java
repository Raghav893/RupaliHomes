package com.raghav.rupaliconstbackend.repository;

import com.raghav.rupaliconstbackend.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findAllByOrderByCreatedAtDesc();
    List<Inquiry> findAllByNormalUserIdOrderByCreatedAtDesc(Long normalUserId);
}
