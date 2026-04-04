package com.esports.battleengine.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NewsArticle {
    private String title;
    private String description;
    private String image;
    private String url;
    private String publishedAt;
    private String sourceName;
}
