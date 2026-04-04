package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.models.JoinRequest;
import com.esports.battleengine.backend.models.Team;
import com.esports.battleengine.backend.repositories.JoinRequestRepository;
import com.esports.battleengine.backend.repositories.TeamRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final TeamRepository teamRepository;

    public JoinRequestService(JoinRequestRepository joinRequestRepository, TeamRepository teamRepository) {
        this.joinRequestRepository = joinRequestRepository;
        this.teamRepository = teamRepository;
    }

    /**
     * Create a new join request (player requests to join a team).
     */
    public JoinRequest createRequest(String teamId, String userId, String username) {
        // Check if team exists
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) {
            throw new RuntimeException("Team not found");
        }

        // Check if user is already in this team
        if (team.getPlayerIds() != null && team.getPlayerIds().contains(userId)) {
            throw new RuntimeException("You are already a member of this team");
        }

        // Check for existing pending request
        Optional<JoinRequest> existing = joinRequestRepository
                .findByTeamIdAndUserIdAndStatus(teamId, userId, "PENDING");
        if (existing.isPresent()) {
            throw new RuntimeException("You already have a pending request for this team");
        }

        JoinRequest request = JoinRequest.builder()
                .teamId(teamId)
                .userId(userId)
                .username(username)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return joinRequestRepository.save(request);
    }

    /**
     * Get all pending requests for a team (for manager to review).
     */
    public List<JoinRequest> getPendingRequestsForTeam(String teamId) {
        return joinRequestRepository.findByTeamIdAndStatus(teamId, "PENDING");
    }

    /**
     * Get all requests for a team (any status).
     */
    public List<JoinRequest> getAllRequestsForTeam(String teamId) {
        return joinRequestRepository.findByTeamId(teamId);
    }

    /**
     * Get all requests by a specific user.
     */
    public List<JoinRequest> getRequestsByUser(String userId) {
        return joinRequestRepository.findByUserId(userId);
    }

    /**
     * Accept a join request: adds the user to the team's playerIds.
     */
    public JoinRequest acceptRequest(String requestId, String managerUserId) {
        JoinRequest request = joinRequestRepository.findById(requestId).orElse(null);
        if (request == null) {
            throw new RuntimeException("Join request not found");
        }

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("This request has already been processed");
        }

        // Verify the manager owns this team
        Team team = teamRepository.findById(request.getTeamId()).orElse(null);
        if (team == null) {
            throw new RuntimeException("Team not found");
        }
        if (team.getManagerId() == null || !team.getManagerId().equals(managerUserId)) {
            throw new RuntimeException("Only the team manager can accept requests");
        }

        // Add user to team
        if (!team.getPlayerIds().contains(request.getUserId())) {
            team.getPlayerIds().add(request.getUserId());
            teamRepository.save(team);
        }

        // Update request status
        request.setStatus("ACCEPTED");
        request.setRespondedAt(LocalDateTime.now());
        return joinRequestRepository.save(request);
    }

    /**
     * Reject a join request.
     */
    public JoinRequest rejectRequest(String requestId, String managerUserId) {
        JoinRequest request = joinRequestRepository.findById(requestId).orElse(null);
        if (request == null) {
            throw new RuntimeException("Join request not found");
        }

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("This request has already been processed");
        }

        // Verify the manager owns this team
        Team team = teamRepository.findById(request.getTeamId()).orElse(null);
        if (team == null) {
            throw new RuntimeException("Team not found");
        }
        if (team.getManagerId() == null || !team.getManagerId().equals(managerUserId)) {
            throw new RuntimeException("Only the team manager can reject requests");
        }

        request.setStatus("REJECTED");
        request.setRespondedAt(LocalDateTime.now());
        return joinRequestRepository.save(request);
    }
}
