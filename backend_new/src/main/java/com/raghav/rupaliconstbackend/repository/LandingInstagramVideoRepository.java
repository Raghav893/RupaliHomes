package com.raghav.rupaliconstbackend.repository;

import com.raghav.rupaliconstbackend.entity.LandingInstagramVideo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LandingInstagramVideoRepository extends JpaRepository<LandingInstagramVideo, Long> {
    List<LandingInstagramVideo> findAllByIsPublishedTrueOrderByDisplayOrderAscCreatedAtDesc();
    List<LandingInstagramVideo> findAllByOrderByDisplayOrderAscCreatedAtDesc();
}
