package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.JoinRequest;
import com.esports.battleengine.backend.security.services.UserDetailsImpl;
import com.esports.battleengine.backend.services.JoinRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/join-requests")
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    public JoinRequestController(JoinRequestService joinRequestService) {
        this.joinRequestService = joinRequestService;
    }

    /**
     * Player sends a request to join a team.
     * Body: { "teamId": "<team_id>" }
     */
    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody Map<String, String> body) {
        try {
            String teamId = body.get("teamId");
            if (teamId == null || teamId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "teamId is required"));
            }

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId;
            String username;
            if (principal instanceof UserDetailsImpl) {
                userId = ((UserDetailsImpl) principal).getId();
                username = ((UserDetailsImpl) principal).getUsername();
            } else {
                return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
            }

            JoinRequest request = joinRequestService.createRequest(teamId, userId, username);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get pending requests for a team (team manager view).
     */
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<JoinRequest>> getTeamRequests(@PathVariable String teamId) {
        return ResponseEntity.ok(joinRequestService.getPendingRequestsForTeam(teamId));
    }

    /**
     * Get all requests by the current user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<JoinRequest>> getMyRequests() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            String userId = ((UserDetailsImpl) principal).getId();
            return ResponseEntity.ok(joinRequestService.getRequestsByUser(userId));
        }
        return ResponseEntity.ok(List.of());
    }

    /**
     * Accept a join request (team manager only).
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable String id) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
            }
            String managerUserId = ((UserDetailsImpl) principal).getId();
            JoinRequest request = joinRequestService.acceptRequest(id, managerUserId);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Reject a join request (team manager only).
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable String id) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
            }
            String managerUserId = ((UserDetailsImpl) principal).getId();
            JoinRequest request = joinRequestService.rejectRequest(id, managerUserId);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
