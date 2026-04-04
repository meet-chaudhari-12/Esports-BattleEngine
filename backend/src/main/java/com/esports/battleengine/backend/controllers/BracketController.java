package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.services.BracketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brackets")
public class BracketController {

    private final BracketService bracketService;

    public BracketController(BracketService bracketService) {
        this.bracketService = bracketService;
    }

    @PostMapping("/{tournamentId}/generate")
    public List<Match> generateBracket(@PathVariable String tournamentId) {
        return bracketService.generateSingleElimination(tournamentId);
    }
}
