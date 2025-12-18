package com.esports.battleengine.backend.repositories;

import com.esports.battleengine.backend.models.Tournament;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TournamentRepository extends MongoRepository<Tournament, String> {
}
