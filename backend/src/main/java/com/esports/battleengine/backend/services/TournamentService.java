package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.exceptions.ApiException;
import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.repositories.TournamentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TournamentService {

    private final TournamentRepository repository;

    public TournamentService(TournamentRepository repository) {
        this.repository = repository;
    }

    public Tournament create(Tournament tournament) {
        tournament.setStatus("UPCOMING");
        return repository.save(tournament);
    }

    public List<Tournament> getAll() {
        return repository.findAll();
    }

    public Tournament getById(String id) {
        return repository.findById(id).orElse(null);
    }

    public Tournament lockTournament(String tournamentId) {
        Tournament tournament = repository.findById(tournamentId)
                .orElseThrow(() -> new ApiException("Tournament not found"));

        tournament.setLocked(true);
        return repository.save(tournament);
    }

}
