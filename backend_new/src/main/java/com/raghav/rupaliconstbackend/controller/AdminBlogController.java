package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.BlogModerateDTO;
import com.raghav.rupaliconstbackend.DTO.BlogResponseDTO;
import com.raghav.rupaliconstbackend.DTO.BlogSubmitDTO;
import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.entity.BlogPost;
import com.raghav.rupaliconstbackend.entity.BlogStatus;
import com.raghav.rupaliconstbackend.entity.User;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.BlogPostRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/blogs")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminBlogController {

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BlogResponseDTO> createBlog(
            @Valid @RequestBody BlogSubmitDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User moderator = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Moderator not found"));

        BlogPost post = new BlogPost();
        post.setAuthorName(dto.getAuthorName());
        post.setAuthorEmail(dto.getAuthorEmail());
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());
        post.setStatus(BlogStatus.APPROVED);
        post.setModeratedAt(Instant.now());
        post.setModeratedBy(moderator);

        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(toDto(blogPostRepository.save(post)));
    }

    @GetMapping
    public ResponseEntity<Page<BlogResponseDTO>> getAllBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BlogResponseDTO> blogs = blogPostRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDto);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponseDTO> getBlog(@PathVariable Long id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        return ResponseEntity.ok(toDto(post));
    }

    @PutMapping("/{id}/moderate")
    public ResponseEntity<BlogResponseDTO> moderateBlog(
            @PathVariable Long id,
            @Valid @RequestBody BlogModerateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));

        if (dto.getStatus() == BlogStatus.PENDING) {
            throw new BadRequestException("Cannot set status back to PENDING");
        }

        if (dto.getStatus() == BlogStatus.REJECTED && (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank())) {
            throw new BadRequestException("Rejection reason is required when rejecting a blog post");
        }

        User moderator = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Moderator not found"));

        post.setStatus(dto.getStatus());
        post.setRejectionReason(dto.getRejectionReason());
        post.setModeratedAt(Instant.now());
        post.setModeratedBy(moderator);

        BlogPost saved = blogPostRepository.save(post);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("Blog post not found");
        }
        blogPostRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private BlogResponseDTO toDto(BlogPost post) {
        BlogResponseDTO dto = new BlogResponseDTO();
        dto.setId(post.getId());
        dto.setAuthorName(post.getAuthorName());
        dto.setAuthorEmail(post.getAuthorEmail());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setStatus(post.getStatus());
        dto.setRejectionReason(post.getRejectionReason());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setModeratedAt(post.getModeratedAt());
        dto.setModeratedByName(post.getModeratedBy() != null ? post.getModeratedBy().getName() : null);
        return dto;
    }
}
