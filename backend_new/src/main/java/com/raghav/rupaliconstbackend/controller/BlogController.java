package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.DTO.BlogResponseDTO;
import com.raghav.rupaliconstbackend.DTO.BlogSubmitDTO;
import com.raghav.rupaliconstbackend.entity.BlogPost;
import com.raghav.rupaliconstbackend.entity.BlogStatus;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import com.raghav.rupaliconstbackend.repository.BlogPostRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/blogs")
public class BlogController {

    private final BlogPostRepository blogPostRepository;

    @PostMapping
    public ResponseEntity<BlogResponseDTO> submitBlog(@Valid @RequestBody BlogSubmitDTO dto) {
        BlogPost post = new BlogPost();
        post.setAuthorName(dto.getAuthorName());
        post.setAuthorEmail(dto.getAuthorEmail());
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());
        post.setStatus(BlogStatus.PENDING);

        BlogPost saved = blogPostRepository.save(post);
        return new ResponseEntity<>(toDto(saved), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<BlogResponseDTO>> getApprovedBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BlogResponseDTO> blogs = blogPostRepository
                .findAllByStatus(BlogStatus.APPROVED, pageable)
                .map(this::toDto);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponseDTO> getApprovedBlog(@PathVariable Long id) {
        BlogPost post = blogPostRepository.findByIdAndStatus(id, BlogStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        return ResponseEntity.ok(toDto(post));
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
