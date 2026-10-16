package com.raghav.rupaliconstbackend.repository;

import com.raghav.rupaliconstbackend.entity.Testimonial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {

    List<Testimonial> findAllByIsPublishedTrueOrderByDisplayOrderAscCreatedAtDesc();

    Page<Testimonial> findAllByOrderByDisplayOrderAscCreatedAtDesc(Pageable pageable);

    List<Testimonial> findAllByOrderByDisplayOrderAscCreatedAtDesc();

    Optional<Testimonial> findByIdAndIsPublishedTrue(Long id);
}
