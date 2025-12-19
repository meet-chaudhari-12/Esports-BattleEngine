package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.dto.LeaderboardEntry;
import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.repositories.MatchRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LeaderboardService {

    private final MatchRepository matchRepository;

    public LeaderboardService(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    public List<LeaderboardEntry> getLeaderboard(String tournamentId) {

        List<Match> matches =
                matchRepository.findByTournamentIdAndStatus(
                        tournamentId, "COMPLETED"
                );

        Map<String, Integer> scoreMap = new HashMap<>();

        for (Match match : matches) {
            Map<String, Integer> matchScore = match.getFinalScore();
            if (matchScore == null) continue;

            for (Map.Entry<String, Integer> entry : matchScore.entrySet()) {
                scoreMap.merge(entry.getKey(), entry.getValue(), Integer::sum);
            }
        }

        List<LeaderboardEntry> leaderboard = new ArrayList<>();

        List<Map.Entry<String, Integer>> sorted =
                scoreMap.entrySet()
                        .stream()
                        .sorted((a, b) -> b.getValue() - a.getValue())
                        .toList();

        int rank = 1;
        for (Map.Entry<String, Integer> entry : sorted) {
            leaderboard.add(
                    new LeaderboardEntry(
                            entry.getKey(),
                            entry.getValue(),
                            rank++
                    )
            );
        }

        return leaderboard;
    }
}
