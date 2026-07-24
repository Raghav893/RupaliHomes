package com.raghav.rupaliconstbackend.Repositories;

import com.raghav.rupaliconstbackend.entity.Insta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstaRepository extends JpaRepository<Insta, Long> {
}
