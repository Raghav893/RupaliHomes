package com.raghav.rupaliconstbackend.tools;

import com.raghav.rupaliconstbackend.exception.BadRequestException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VideoEmbedUtil {

    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "^(?:https?:\\/\\/)?(?:www\\.|m\\.)?(?:youtube\\.com\\/(?:watch\\?(?:.*&)?v=|embed\\/|shorts\\/|v\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern INSTAGRAM_PATTERN = Pattern.compile(
            "^(?:https?:\\/\\/)?(?:www\\.)?instagram\\.com\\/(?:reel|reels|p|tv)\\/([a-zA-Z0-9_-]+)(?:\\/.*)?$",
            Pattern.CASE_INSENSITIVE
    );

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParsedVideoInfo {
        private String platform; // "YOUTUBE" | "INSTAGRAM"
        private String embedId;
        private String embedUrl;
        private String defaultThumbnailUrl;
        private String canonicalUrl;
    }

    public static ParsedVideoInfo parseAndValidate(String rawUrl) {
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            throw new BadRequestException("Video URL cannot be empty");
        }

        String url = rawUrl.trim();

        Matcher ytMatcher = YOUTUBE_PATTERN.matcher(url);
        if (ytMatcher.find()) {
            String videoId = ytMatcher.group(1);
            return ParsedVideoInfo.builder()
                    .platform("YOUTUBE")
                    .embedId(videoId)
                    .embedUrl("https://www.youtube-nocookie.com/embed/" + videoId)
                    .defaultThumbnailUrl("https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg")
                    .canonicalUrl("https://www.youtube.com/watch?v=" + videoId)
                    .build();
        }

        Matcher igMatcher = INSTAGRAM_PATTERN.matcher(url);
        if (igMatcher.find()) {
            String postId = igMatcher.group(1);
            return ParsedVideoInfo.builder()
                    .platform("INSTAGRAM")
                    .embedId(postId)
                    .embedUrl("https://www.instagram.com/p/" + postId + "/")
                    .defaultThumbnailUrl(null)
                    .canonicalUrl("https://www.instagram.com/p/" + postId + "/")
                    .build();
        }

        throw new BadRequestException(
                "Invalid video URL. Please provide a valid YouTube (youtube.com/watch, youtu.be, youtube.com/shorts) " +
                "or Instagram (instagram.com/reel, instagram.com/p) link."
        );
    }
}
