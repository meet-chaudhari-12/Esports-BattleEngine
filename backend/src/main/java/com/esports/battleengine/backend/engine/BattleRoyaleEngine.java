package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.models.MatchStatus;
import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.repositories.MatchRepository;
import com.esports.battleengine.backend.services.GameRuleService;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component("BATTLE_ROYALE_ENGINE")
public class BattleRoyaleEngine extends AbstractTournamentEngine {

    public BattleRoyaleEngine(MatchRepository matchRepository, GameRuleService gameRuleService, ScoringEngineFactory scoringEngineFactory) {
        super(matchRepository, gameRuleService, scoringEngineFactory);
    }

    @Override
    public void generateMatches(Tournament tournament) {
        // Simple BR implementation: All teams in one match or group matches
        // For now, reusing bracket-like logic but adjusted for BR (16 teams per match if needed)
        List<String> teamIds = tournament.getTeamIds();
        List<String> shuffled = new ArrayList<>(teamIds);
        Collections.shuffle(shuffled);

        Match match = Match.builder()
                .tournamentId(tournament.getId())
                .gameName(tournament.getGameName())
                .gameType(tournament.getGameType())
                .teamIds(shuffled)
                .status(MatchStatus.SCHEDULED)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .round(1)
                .bracketIndex(0)
                .build();
        matchRepository.save(match);
    }
}
