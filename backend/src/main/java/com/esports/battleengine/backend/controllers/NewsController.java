package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.dto.NewsArticle;
import com.esports.battleengine.backend.services.NewsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public List<NewsArticle> getLatestNews() {
        return newsService.getLatestEsportsNews();
    }
}
