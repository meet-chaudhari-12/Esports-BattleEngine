package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.GameRule;

import java.util.Map;

public interface ScoringEngine {

    /**
     * @param rawData   match submitted data (kills, placement, rounds, etc.)
     * @param rule      game rule fetched by game name
     * @return          calculated score per teamId
     */
    Map<String, Integer> calculateScore(
            Map<String, Object> rawData,
            GameRule rule
    );
}
