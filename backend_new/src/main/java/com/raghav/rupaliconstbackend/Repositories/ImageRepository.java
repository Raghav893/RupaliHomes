package com.raghav.rupaliconstbackend.Repositories;

import com.raghav.rupaliconstbackend.entity.ImageModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<ImageModel, Long> {
}
