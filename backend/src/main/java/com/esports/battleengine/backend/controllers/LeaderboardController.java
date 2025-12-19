package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.dto.LeaderboardEntry;
import com.esports.battleengine.backend.services.LeaderboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/{tournamentId}")
    public List<LeaderboardEntry> getLeaderboard(
            @PathVariable String tournamentId
    ) {
        return leaderboardService.getLeaderboard(tournamentId);
    }
}
