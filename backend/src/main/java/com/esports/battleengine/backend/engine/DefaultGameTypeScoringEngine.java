package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.models.ScoringType;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("DEFAULT")
public class DefaultGameTypeScoringEngine implements ScoringEngine {

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Integer> calculateScore(Map<String, Object> rawData, GameRule rule) {
        Map<String, Integer> result = new HashMap<>();
        ScoringType scoringType = rule.getScoringType();
        Map<String, Object> config = rule.getRuleConfig();

        for (String teamId : rawData.keySet()) {
            Map<String, Object> teamStats = (Map<String, Object>) rawData.get(teamId);
            int score = 0;

            if (scoringType == ScoringType.PLACEMENT) {
                int placement = ((Number) teamStats.getOrDefault("placement", 0)).intValue();
                Map<String, Object> placementPoints = (Map<String, Object>) config.get("placementPoints");
                if (placementPoints != null) {
                    score += ((Number) placementPoints.getOrDefault(String.valueOf(placement), 0)).intValue();
                }
                
                // Add kill points if applicable for Battle Royale
                int kills = ((Number) teamStats.getOrDefault("kills", 0)).intValue();
                int killPoint = ((Number) config.getOrDefault("killPoint", 0)).intValue();
                score += (kills * killPoint);

            } else if (scoringType == ScoringType.ROUND) {
                int roundsWon = ((Number) teamStats.getOrDefault("roundsWon", 0)).intValue();
                int roundWinPoint = ((Number) config.getOrDefault("roundWinPoint", 1)).intValue();
                score = roundsWon * roundWinPoint;

            } else if (scoringType == ScoringType.POINTS) {
                score = ((Number) teamStats.getOrDefault("score", 0)).intValue();

            } else if (scoringType == ScoringType.TIME) {
                int time = ((Number) teamStats.getOrDefault("time", 0)).intValue();
                // Lower time ranks higher
                score = -time;
            }

            result.put(teamId, score);
        }

        return result;
    }
}
