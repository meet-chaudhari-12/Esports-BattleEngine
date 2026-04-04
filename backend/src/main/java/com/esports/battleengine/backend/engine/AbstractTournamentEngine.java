package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.models.MatchStatus;
import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.repositories.MatchRepository;
import com.esports.battleengine.backend.services.GameRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
public abstract class AbstractTournamentEngine implements TournamentEngine {

    protected final MatchRepository matchRepository;
    protected final GameRuleService gameRuleService;
    protected final ScoringEngineFactory scoringEngineFactory;

    @Override
    public void processMatchResult(Match match, Map<String, Object> result) {
        GameRule rule = gameRuleService.getRuleByGameName(match.getGameName());
        ScoringEngine engine = scoringEngineFactory.getEngine(rule.getGameName(), rule.getGameType());

        Map<String, Integer> score = engine.calculateScore(result, rule);

        match.setRawResult(result);
        match.setFinalScore(score);
        match.setStatus(MatchStatus.COMPLETED);
        match.setCompletedAt(LocalDateTime.now());

        // Determine Winner (highest score)
        String winnerId = null;
        int maxScore = -1;
        for (Map.Entry<String, Integer> entry : score.entrySet()) {
            if (entry.getValue() > maxScore) {
                maxScore = entry.getValue();
                winnerId = entry.getKey();
            }
        }

        if (winnerId != null) {
            match.setWinnerTeamId(winnerId);
            advanceWinner(match);
        }

        matchRepository.save(match);
    }

    @Override
    public void advanceWinner(Match match) {
        if (match.getNextMatchId() == null) return;

        Optional<Match> nextMatchOpt = matchRepository.findById(match.getNextMatchId());
        if (nextMatchOpt.isPresent()) {
            Match nextMatch = nextMatchOpt.get();
            if (nextMatch.getTeamIds() == null) {
                nextMatch.setTeamIds(new ArrayList<>());
            }
            if (!nextMatch.getTeamIds().contains(match.getWinnerTeamId())) {
                nextMatch.getTeamIds().add(match.getWinnerTeamId());
                matchRepository.save(nextMatch);
            }
        }
    }
}
