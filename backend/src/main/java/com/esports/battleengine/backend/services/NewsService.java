package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.dto.NewsArticle;
import com.esports.battleengine.backend.dto.NewsResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NewsService {

    private final RestTemplate restTemplate;
    private static final String API_URL = "https://gnews.io/api/v4/search?q=esports&lang=en&max=10&apikey=7978ff946c7ffd802232db3dfbced378";

    public NewsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<NewsArticle> getLatestEsportsNews() {
        try {
            System.out.println("Fetching news from: " + API_URL);
            NewsResponse response = restTemplate.getForObject(API_URL, NewsResponse.class);
            System.out.println("GNews response received. Total: " + (response != null ? response.getTotalArticles() : "null"));

            if (response != null && response.getArticles() != null) {
                return response.getArticles().stream()
                        .map(article -> NewsArticle.builder()
                                .title(article.getTitle())
                                .description(article.getDescription())
                                .image(article.getImage())
                                .url(article.getUrl())
                                .publishedAt(article.getPublishedAt())
                                .sourceName(article.getSource() != null ? article.getSource().getName() : null)
                                .build())
                        .collect(Collectors.toList());
            } else {
                System.out.println("No articles found or response is null.");
            }
        } catch (Exception e) {
            System.err.println("CRITICAL: Error fetching news: " + e.getMessage());
            e.printStackTrace();
        }

        return new ArrayList<>();
    }
}
