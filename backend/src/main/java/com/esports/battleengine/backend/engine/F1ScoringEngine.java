package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.GameRule;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("F123")
public class F1ScoringEngine implements ScoringEngine {

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Integer> calculateScore(Map<String, Object> rawData, GameRule rule) {
        Map<String, Integer> result = new HashMap<>();

        /**
         * rawData format for F1:
         * {
         *   "teamId1": { "position": 1, "fastestLap": true },
         *   "teamId2": { "position": 2, "fastestLap": false }
         * }
         * 
         * ruleConfig: { "pointsTable": { "1": 25, "2": 18, ... }, "fastestLapBonus": 1 }
         */

        Map<String, Integer> pointsTable = (Map<String, Integer>) rule.getRuleConfig().get("pointsTable");
        int fastestLapBonus = ((Number) rule.getRuleConfig().getOrDefault("fastestLapBonus", 0)).intValue();

        for (String teamId : rawData.keySet()) {
            Map<String, Object> teamData = (Map<String, Object>) rawData.get(teamId);
            int position = ((Number) teamData.getOrDefault("position", 0)).intValue();
            boolean fastestLap = (boolean) teamData.getOrDefault("fastestLap", false);

            int score = pointsTable.getOrDefault(String.valueOf(position), 0);
            if (fastestLap) {
                score += fastestLapBonus;
            }

            result.put(teamId, score);
        }

        return result;
    }
}
