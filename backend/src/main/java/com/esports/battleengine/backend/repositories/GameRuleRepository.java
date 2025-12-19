package com.esports.battleengine.backend.repositories;

import com.esports.battleengine.backend.models.GameRule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface GameRuleRepository extends MongoRepository<GameRule, String> {

    Optional<GameRule> findByGameName(String gameName);
}
