package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.services.GameRuleService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rules")
public class GameRuleController {

    private final GameRuleService gameRuleService;

    public GameRuleController(GameRuleService gameRuleService) {
        this.gameRuleService = gameRuleService;
    }

    @PostMapping
    public GameRule createRule(@RequestBody GameRule rule) {
        return gameRuleService.createRule(rule);
    }

    @GetMapping("/{gameName}")
    public GameRule getRule(@PathVariable String gameName) {
        return gameRuleService.getRuleByGame(gameName);
    }
}
