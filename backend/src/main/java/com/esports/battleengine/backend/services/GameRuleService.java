package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.repositories.GameRuleRepository;
import org.springframework.stereotype.Service;

@Service
public class GameRuleService {

    private final GameRuleRepository gameRuleRepository;

    public GameRuleService(GameRuleRepository gameRuleRepository) {
        this.gameRuleRepository = gameRuleRepository;
    }

    public GameRule createRule(GameRule rule) {
        return gameRuleRepository.save(rule);
    }

    public GameRule getRuleByGame(String gameName) {
        return gameRuleRepository.findByGameName(gameName)
                .orElseThrow(() -> new RuntimeException("Game rule not found for game: " + gameName));
    }
}
