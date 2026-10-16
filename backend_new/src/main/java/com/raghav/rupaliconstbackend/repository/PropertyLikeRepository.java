package com.raghav.rupaliconstbackend.repository;

import com.raghav.rupaliconstbackend.entity.PropertyLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PropertyLikeRepository extends JpaRepository<PropertyLike, Long> {
    Optional<PropertyLike> findByVisitorIdAndPropertyId(String visitorId, Long propertyId);
    List<PropertyLike> findAllByVisitorId(String visitorId);
    boolean existsByVisitorIdAndPropertyId(String visitorId, Long propertyId);
    long countByPropertyId(Long propertyId);

    @Query("select l.propertyId as propertyId, count(l) as likeCount " +
            "from PropertyLike l where l.propertyId in :propertyIds group by l.propertyId")
    List<PropertyLikeCount> countLikesByPropertyIds(@Param("propertyIds") List<Long> propertyIds);

    interface PropertyLikeCount {
        Long getPropertyId();
        long getLikeCount();
    }
}
