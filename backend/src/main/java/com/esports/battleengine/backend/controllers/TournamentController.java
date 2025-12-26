package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.services.TournamentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentService service;

    public TournamentController(TournamentService service) {
        this.service = service;
    }

    @PostMapping
    public Tournament create(@RequestBody Tournament tournament) {
        return service.create(tournament);
    }

    @GetMapping
    public List<Tournament> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Tournament getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping("/{id}/lock")
    public Tournament lockTournament(@PathVariable String id) {
        return service.lockTournament(id);
    }

}
