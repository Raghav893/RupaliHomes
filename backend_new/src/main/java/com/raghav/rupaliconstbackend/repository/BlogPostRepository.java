package com.raghav.rupaliconstbackend.repository;

import com.raghav.rupaliconstbackend.entity.BlogPost;
import com.raghav.rupaliconstbackend.entity.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Page<BlogPost> findAllByStatus(BlogStatus status, Pageable pageable);

    Optional<BlogPost> findByIdAndStatus(Long id, BlogStatus status);

    Page<BlogPost> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
