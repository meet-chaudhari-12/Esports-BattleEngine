package com.esports.battleengine.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class NewsResponse {
    private int totalArticles;
    private List<GNewsArticle> articles;

    @Data
    public static class GNewsArticle {
        private String title;
        private String description;
        private String content;
        private String url;
        private String image;
        private String publishedAt;
        private GNewsSource source;
    }

    @Data
    public static class GNewsSource {
        private String name;
        private String url;
    }
}
