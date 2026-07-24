package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.entity.Insta;
import com.raghav.rupaliconstbackend.service.Instaservice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class InstaController {
    private final Instaservice service;

    public InstaController(Instaservice service) {
        this.service = service;
    }

    @PostMapping("/posts")
    public ResponseEntity<Insta> CreatePost(@RequestBody Insta insta) {
        return new ResponseEntity<>(service.createPosts(insta), HttpStatus.CREATED);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Insta>> getAllPosts() {
        return new ResponseEntity<>(service.getAllPosts(),HttpStatus.OK);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Insta> getInstaPostById(@PathVariable Long Id) {
        return new ResponseEntity<>(service.getPostById(Id),HttpStatus.OK);
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<Insta> updatePost(@PathVariable("id") Long id, @RequestBody Insta insta) {
        return new ResponseEntity<>(service.updatePost(id, insta), HttpStatus.OK);
    }

    @DeleteMapping("/posts")
    public ResponseEntity<String> deleteString(@PathVariable Long id) {
        service.deletePostById(id);
        return ResponseEntity.ok("Deleted");
    }
}
