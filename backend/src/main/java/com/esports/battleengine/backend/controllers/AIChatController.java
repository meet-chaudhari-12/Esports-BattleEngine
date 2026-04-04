package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.services.AIChatService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final AIChatService aiService;

    public AIChatController(AIChatService aiService) {
        this.aiService = aiService;
    }

    /**
     * POST /api/ai/chat
     * Body: { "message": "user input text" }
     * Returns: { "response": "ai generated response" }
     */
    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String userMsg = request.get("message");
        String response = aiService.processRequest(userMsg);
        return Map.of("response", response);
    }
}
