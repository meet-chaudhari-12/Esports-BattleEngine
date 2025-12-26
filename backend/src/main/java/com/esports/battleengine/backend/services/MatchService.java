package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.engine.ScoringEngine;
import com.esports.battleengine.backend.engine.ScoringEngineFactory;
import com.esports.battleengine.backend.exceptions.ApiException;
import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.models.MatchStatus;
import com.esports.battleengine.backend.models.Tournament;
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
    private final TournamentService tournamentService;

    public MatchService(
            MatchRepository matchRepository,
            GameRuleService gameRuleService,
            ScoringEngineFactory scoringEngineFactory, TournamentService tournamentService
    ) {
        this.matchRepository = matchRepository;
        this.gameRuleService = gameRuleService;
        this.scoringEngineFactory = scoringEngineFactory;
        this.tournamentService = tournamentService;
    }

    public Match scheduleMatch(Match match) {

        // 🔒 Tournament locking check (ADD THIS)
        Tournament tournament = tournamentService.getById(match.getTournamentId());
        if (tournament == null) {
            throw new ApiException("Tournament not found");
        }
        if (Boolean.TRUE.equals(tournament.getLocked())) {
            throw new ApiException("Tournament is locked. Cannot schedule matches.");
        }


        // 1️⃣ Basic sanity checks
        if (match.getGame() == null) {
            throw new ApiException("Game must be specified for match");
        }
        if (match.getTeamIds() == null || match.getTeamIds().isEmpty()) {
            throw new ApiException("Match must contain at least one team");
        }
        // 2️⃣ Load rule for this game
        GameRule rule = gameRuleService.getRuleByGame(match.getGame());
        // 3️⃣ Rule-based validation
        if (match.getTeamIds().size() > rule.getTeamsPerMatch()) {
            throw new ApiException(
                    "Max teams allowed for " + match.getGame() + " is " + rule.getTeamsPerMatch()
            );
        }
        // 4️⃣ Finalize match
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
                .orElseThrow(() -> new ApiException("Match not found"));

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
