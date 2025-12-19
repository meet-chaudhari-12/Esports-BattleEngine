package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.services.MatchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService service;

    public MatchController(MatchService service) {
        this.service = service;
    }

    @PostMapping("/schedule")
    public Match schedule(@RequestBody Match match) {
        match.setGame("BGMI");
        return service.scheduleMatch(match);
    }

    @PostMapping("/{id}/result")
    public Match submitResult(
            @PathVariable String id,
            @RequestBody Map<String, Object> rawData
    ) {
        return service.submitResult(id, rawData);
    }


    @GetMapping("/tournament/{tournamentId}")
    public List<Match> getByTournament(@PathVariable String tournamentId) {
        return service.getMatchesByTournament(tournamentId);
    }
}
