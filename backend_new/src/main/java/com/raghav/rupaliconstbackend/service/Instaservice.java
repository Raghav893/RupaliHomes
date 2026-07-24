package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.Repositories.InstaRepository;
import com.raghav.rupaliconstbackend.entity.Insta;
import com.raghav.rupaliconstbackend.exception.BadRequestException;
import com.raghav.rupaliconstbackend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Instaservice {
    private final InstaRepository repository;

    public Instaservice(InstaRepository repository) {
        this.repository = repository;
    }
    public Insta createPosts(Insta insta){
        return repository.save(insta);
    }
    public List<Insta> getAllPosts(){
        return repository.findAll();
    }
    public Insta getPostById(Long id){
        Optional<Insta> Oi = null;
        try {
            Oi = repository.findById(id);
        } catch (Exception e) {
            throw new BadRequestException("Not found");
        }
        return Oi.get();
    }
    public Insta updatePost(Long id, Insta insta){
        Insta existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insta post not found: " + id));
        if (insta.getPostUrl() != null) {
            existing.setPostUrl(insta.getPostUrl());
        }
        return repository.save(existing);
    }
    public void deletePostById(Long id){
        repository.deleteById(id);
    }
}
