package com.esports.battleengine.backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "game_rules")
public class GameRule {

    @Id
    private String id;

    // Example: BGMI, VALORANT
    private String gameName;

    // Players per team (BGMI = 4, Valorant = 5)
    private Integer teamSize;

    // Teams per match (BGMI = 16, Valorant = 2)
    private Integer teamsPerMatch;

    // PLACEMENT, KILL, ROUND, POINTS
    private ScoringType scoringType;

    // Flexible config:
    // { "killPoint": 1, "placementPoints": { "1": 15, "2": 12 } }
    private Map<String, Object> ruleConfig;
}
