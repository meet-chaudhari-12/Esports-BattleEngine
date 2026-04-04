package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.models.MatchStatus;
import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.repositories.MatchRepository;
import com.esports.battleengine.backend.repositories.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class BracketService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    public BracketService(MatchRepository matchRepository, TournamentRepository tournamentRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
    }

    /**
     * Generates a Single Elimination Bracket for the given tournament.
     * Note: This strictly assumes 2-team matches (1v1 team).
     */
    @Transactional
    public List<Match> generateSingleElimination(String tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        List<String> teams = new ArrayList<>(tournament.getTeamIds());
        Collections.shuffle(teams); // Random Seeds

        // 1. Calculate Bracket Size (Next Power of 2)
        int teamCount = teams.size();
        int bracketSize = 1;
        while (bracketSize < teamCount) {
            bracketSize *= 2;
        }

        // Add 'BYE' placeholders if needed
        while (teams.size() < bracketSize) {
            teams.add("BYE"); 
        }

        List<Match> createdMatches = new ArrayList<>();
        int totalRounds = (int) (Math.log(bracketSize) / Math.log(2));

        // We generate matches from Final (Round N) down to Round 1, or Vice Versa?
        // Easier: Generate Round 1, then Round 2 linkage.
        // Actually, to link "nextMatchId", it's easier to generate the tree structure first? 
        // Or generate distinct objects and link them later.
        
        // Let's generate layer by layer.
        // Round 1: bracketSize / 2 matches.
        
        // We need to store matches by (Round, Index) to link them.
        List<List<Match>> bracketStructure = new ArrayList<>();

        for (int r = 1; r <= totalRounds; r++) {
            List<Match> roundMatches = new ArrayList<>();
            int matchesInRound = bracketSize / (int) Math.pow(2, r);

            for (int i = 0; i < matchesInRound; i++) {
                Match match = Match.builder()
                        .id(UUID.randomUUID().toString()) // Pre-generate ID for linking
                        .tournamentId(tournamentId)
                        .gameName(tournament.getGameName())
                        .gameType(tournament.getGameType())
                        .status(MatchStatus.SCHEDULED)
                        .round(r)
                        .bracketIndex(i)
                        .teamIds(new ArrayList<>()) 
                        .build();
                
                roundMatches.add(match);
            }
            bracketStructure.add(roundMatches);
        }

        // Link Rounds (Winner of Round R goes to Round R+1)
        // Round R match i -> Round R+1 match (i / 2)
        for (int r = 0; r < totalRounds - 1; r++) {
            List<Match> currentRound = bracketStructure.get(r);
            List<Match> nextRound = bracketStructure.get(r + 1);

            for (Match match : currentRound) {
                int nextIndex = match.getBracketIndex() / 2;
                Match nextMatch = nextRound.get(nextIndex);
                match.setNextMatchId(nextMatch.getId());
            }
        }

        // Assign Teams to Round 1
        List<Match> round1 = bracketStructure.get(0);
        int teamIdx = 0;
        for (Match match : round1) {
            String teamA = teams.get(teamIdx++);
            String teamB = teams.get(teamIdx++);
            
            match.getTeamIds().add(teamA);
            match.getTeamIds().add(teamB);

            // Auto-advance if BYE
            if (teamB.equals("BYE")) {
                match.setStatus(MatchStatus.COMPLETED);
                match.setWinnerTeamId(teamA);
                // We need to propagate this winner immediately? 
                // For simplicity, we just save state. A separate "Advance" trigger is better.
            } else if (teamA.equals("BYE")) {
                match.setStatus(MatchStatus.COMPLETED);
                match.setWinnerTeamId(teamB);
            }
        }
        
        // Flatten and Save
        for (List<Match> rounds : bracketStructure) {
            createdMatches.addAll(rounds);
        }
        
        return matchRepository.saveAll(createdMatches);
    }
}
