package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.GameRule;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("BGMI")
public class BgmiScoringEngine implements ScoringEngine {

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Integer> calculateScore(
            Map<String, Object> rawData,
            GameRule rule
    ) {

        Map<String, Integer> result = new HashMap<>();

        int killPoint = (int) rule.getRuleConfig().get("killPoint");
        Map<String, Integer> placementPoints =
                (Map<String, Integer>) rule.getRuleConfig().get("placementPoints");

        /**
         * rawData format:
         * {
         *   "teamId1": { "kills": 8, "placement": 1 },
         *   "teamId2": { "kills": 3, "placement": 5 }
         * }
         */

        for (String teamId : rawData.keySet()) {
            Map<String, Integer> teamData =
                    (Map<String, Integer>) rawData.get(teamId);

            int kills = teamData.getOrDefault("kills", 0);
            int placement = teamData.getOrDefault("placement", 0);

            int score =
                    (kills * killPoint)
                            + placementPoints.getOrDefault(
                            String.valueOf(placement), 0
                    );

            result.put(teamId, score);
        }

        return result;
    }
}
