package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.services.MatchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService service;

    public MatchController(MatchService service) {
        this.service = service;
    }

    @PostMapping("/schedule")
    public Match schedule(@RequestBody Match match) {
        return service.scheduleMatch(match);
    }

    @PostMapping("/{id}/result")
    public Match submitResult(
            @PathVariable String id,
            @RequestParam Integer scoreA,
            @RequestParam Integer scoreB
    ) {
        return service.submitResult(id, scoreA, scoreB);
    }

    @GetMapping("/tournament/{tournamentId}")
    public List<Match> getByTournament(@PathVariable String tournamentId) {
        return service.getMatchesByTournament(tournamentId);
    }
}
