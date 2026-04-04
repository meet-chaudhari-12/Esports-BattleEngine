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

@Component("ROUND_BASED_ENGINE")
public class RoundBasedEngine extends AbstractTournamentEngine {

    public RoundBasedEngine(MatchRepository matchRepository, GameRuleService gameRuleService, ScoringEngineFactory scoringEngineFactory) {
        super(matchRepository, gameRuleService, scoringEngineFactory);
    }

    @Override
    public void generateMatches(Tournament tournament) {
        generateBracketMatches(tournament);
    }

    protected void generateBracketMatches(Tournament tournament) {
        List<String> shuffled = new ArrayList<>(tournament.getTeamIds());
        Collections.shuffle(shuffled);

        int round = 1;
        int bracketIdx = 0;

        for (int i = 0; i + 1 < shuffled.size(); i += 2) {
            Match match = Match.builder()
                    .tournamentId(tournament.getId())
                    .gameName(tournament.getGameName())
                    .gameType(tournament.getGameType())
                    .teamIds(List.of(shuffled.get(i), shuffled.get(i + 1)))
                    .status(MatchStatus.SCHEDULED)
                    .scheduledAt(LocalDateTime.now().plusDays(1))
                    .round(round)
                    .bracketIndex(bracketIdx++)
                    .build();
            matchRepository.save(match);
        }

        if (shuffled.size() % 2 != 0) {
            Match byeMatch = Match.builder()
                    .tournamentId(tournament.getId())
                    .gameName(tournament.getGameName())
                    .gameType(tournament.getGameType())
                    .teamIds(List.of(shuffled.get(shuffled.size() - 1)))
                    .status(MatchStatus.SCHEDULED)
                    .scheduledAt(LocalDateTime.now().plusDays(1))
                    .round(round)
                    .bracketIndex(bracketIdx)
                    .build();
            matchRepository.save(byeMatch);
        }
    }
}
