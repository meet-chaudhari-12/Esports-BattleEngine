package com.esports.battleengine.backend.repositories;

import com.esports.battleengine.backend.models.Match;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MatchRepository extends MongoRepository<Match, String> {

    List<Match> findByTournamentId(String tournamentId);

    List<Match> findByTournamentIdAndStatus(String tournamentId, String completed);
}
