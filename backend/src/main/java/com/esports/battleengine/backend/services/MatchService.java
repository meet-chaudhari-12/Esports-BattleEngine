package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.repositories.MatchRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MatchService {

    private final MatchRepository repository;

    public MatchService(MatchRepository repository) {
        this.repository = repository;
    }

    public Match scheduleMatch(Match match) {
        match.setStatus("SCHEDULED");
        match.setScheduledAt(LocalDateTime.now());
        return repository.save(match);
    }

    public Match submitResult(String matchId, Integer scoreA, Integer scoreB) {
        Match match = repository.findById(matchId).orElseThrow();

        match.setScoreA(scoreA);
        match.setScoreB(scoreB);
        match.setStatus("COMPLETED");

        if (scoreA > scoreB) {
            match.setWinnerTeamId(match.getTeamAId());
        } else {
            match.setWinnerTeamId(match.getTeamBId());
        }

        return repository.save(match);
    }

    public List<Match> getMatchesByTournament(String tournamentId) {
        return repository.findByTournamentId(tournamentId);
    }
}
