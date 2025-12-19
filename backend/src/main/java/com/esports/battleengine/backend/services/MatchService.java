package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.engine.ScoringEngine;
import com.esports.battleengine.backend.engine.ScoringEngineFactory;
import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.models.MatchStatus;
import com.esports.battleengine.backend.repositories.MatchRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final GameRuleService gameRuleService;
    private final ScoringEngineFactory scoringEngineFactory;

    public MatchService(
            MatchRepository matchRepository,
            GameRuleService gameRuleService,
            ScoringEngineFactory scoringEngineFactory
    ) {
        this.matchRepository = matchRepository;
        this.gameRuleService = gameRuleService;
        this.scoringEngineFactory = scoringEngineFactory;
    }

    public Match scheduleMatch(Match match) {
        match.setStatus(MatchStatus.SCHEDULED);
        match.setScheduledAt(LocalDateTime.now());
        return matchRepository.save(match);
    }

    public List<Match> getMatchesByTournament(String tournamentId) {
        return matchRepository.findByTournamentId(tournamentId);
    }

    public Match submitResult(
            String matchId,
            Map<String, Object> rawData
    ) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        GameRule rule =
                gameRuleService.getRuleByGame(match.getGame());

        ScoringEngine engine =
                scoringEngineFactory.getEngine(rule.getGameName());

        Map<String, Integer> score =
                engine.calculateScore(rawData, rule);

        match.setRawResult(rawData);
        match.setFinalScore(score);
        match.setStatus(MatchStatus.COMPLETED);

        return matchRepository.save(match);
    }
}
