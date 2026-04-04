package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.GameRule;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("VALORANT")
public class ValorantScoringEngine implements ScoringEngine {

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Integer> calculateScore(Map<String, Object> rawData, GameRule rule) {
        Map<String, Integer> result = new HashMap<>();

        int roundWinPoint = ((Number) rule.getRuleConfig().getOrDefault("roundWinPoint", 1)).intValue();

        for (String teamId : rawData.keySet()) {
            Map<String, Object> teamData = (Map<String, Object>) rawData.get(teamId);
            int roundsWon = ((Number) teamData.getOrDefault("roundsWon", 0)).intValue();
            
            result.put(teamId, roundsWon * roundWinPoint);
        }

        return result;
    }
}
