package com.esports.battleengine.backend.repositories;

import com.esports.battleengine.backend.models.JoinRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends MongoRepository<JoinRequest, String> {

    List<JoinRequest> findByTeamId(String teamId);

    List<JoinRequest> findByUserId(String userId);

    List<JoinRequest> findByTeamIdAndStatus(String teamId, String status);

    List<JoinRequest> findByUserIdAndStatus(String userId, String status);

    Optional<JoinRequest> findByTeamIdAndUserIdAndStatus(String teamId, String userId, String status);
}
