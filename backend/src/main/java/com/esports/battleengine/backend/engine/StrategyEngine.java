package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.repositories.MatchRepository;
import com.esports.battleengine.backend.services.GameRuleService;
import org.springframework.stereotype.Component;

@Component("STRATEGY_ENGINE")
public class StrategyEngine extends RoundBasedEngine {
    public StrategyEngine(MatchRepository matchRepository, GameRuleService gameRuleService, ScoringEngineFactory scoringEngineFactory) {
        super(matchRepository, gameRuleService, scoringEngineFactory);
    }

    @Override
    public void generateMatches(Tournament tournament) {
        super.generateMatches(tournament);
    }
}
