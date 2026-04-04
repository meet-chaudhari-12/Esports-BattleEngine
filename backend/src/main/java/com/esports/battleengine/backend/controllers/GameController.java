package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.models.GameType;
import com.esports.battleengine.backend.services.GameRuleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameRuleService gameRuleService;

    public GameController(GameRuleService gameRuleService) {
        this.gameRuleService = gameRuleService;
    }

    @GetMapping("/by-type/{gameType}")
    public List<GameRule> getRulesByType(@PathVariable GameType gameType) {
        return gameRuleService.getRulesByType(gameType);
    }
}
