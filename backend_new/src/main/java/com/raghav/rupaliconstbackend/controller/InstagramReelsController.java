package com.raghav.rupaliconstbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/instagram")
public class InstagramReelsController {

    private final RestClient restClient;
    private final String accessToken;
    private final String userId;

    public InstagramReelsController(
            @Value("${instagram.access-token:}") String accessToken,
            @Value("${instagram.user-id:}") String userId
    ) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.restClient = RestClient.create();
    }

    @GetMapping("/reels")
    public ResponseEntity<String> getReels(
            @RequestParam(defaultValue = "20") int limit
    ) {
        if (accessToken == null || accessToken.isBlank() || userId == null || userId.isBlank()) {
            return ResponseEntity.ok("{\"data\":[],\"error\":\"Instagram credentials not configured\"}");
        }

        String url = String.format(
                "https://graph.instagram.com/%s/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=%d&access_token=%s",
                userId, limit, accessToken
        );

        try {
            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\":\"Failed to fetch Instagram reels: " + e.getMessage() + "\"}");
        }
    }
}
