package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.repositories.MatchRepository;
import com.esports.battleengine.backend.services.GameRuleService;
import org.springframework.stereotype.Component;

@Component("SPORTS_POINTS_ENGINE")
public class SportsPointsEngine extends RoundBasedEngine {
    public SportsPointsEngine(MatchRepository matchRepository, GameRuleService gameRuleService, ScoringEngineFactory scoringEngineFactory) {
        super(matchRepository, gameRuleService, scoringEngineFactory);
    }

    @Override
    public void generateMatches(Tournament tournament) {
        super.generateMatches(tournament);
    }
}
