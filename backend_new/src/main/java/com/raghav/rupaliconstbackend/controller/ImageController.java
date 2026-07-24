package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.Repositories.ImageRepository;
import com.raghav.rupaliconstbackend.entity.ImageModel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
public class ImageController {

    private final ImageRepository imageRepository;

    @PostMapping("/admin/images/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        ImageModel img = new ImageModel();
        img.setName(file.getOriginalFilename());
        img.setType(file.getContentType());
        img.setPicByte(file.getBytes());
        
        ImageModel savedImage = imageRepository.save(img);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/images/")
                .path(savedImage.getId().toString())
                .toUriString();

        return ResponseEntity.status(HttpStatus.OK).body(fileDownloadUri);
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        ImageModel image = imageRepository.findById(id).orElse(null);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getType()))
                .body(image.getPicByte());
    }
}
