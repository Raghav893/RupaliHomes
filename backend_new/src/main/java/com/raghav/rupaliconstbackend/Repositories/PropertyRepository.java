package com.raghav.rupaliconstbackend.Repositories;

import com.raghav.rupaliconstbackend.entity.Property;
import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    Optional<Property> findByIdAndStatus(Long id, PropertyStatus status);

    long countByStatus(PropertyStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.reactionsCount) FROM Property p")
    Long sumTotalReactions();
}
