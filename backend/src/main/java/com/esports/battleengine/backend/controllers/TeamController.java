package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.Team;
import com.esports.battleengine.backend.services.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<Team> create(@Valid @RequestBody Team team) {
        return ResponseEntity.ok(teamService.createTeam(team));
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAll() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeam(@PathVariable String id) {
        Team team = teamService.getTeamById(id);
        return team == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(team);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> update(@PathVariable String id, @Valid @RequestBody Team team) {
        Team updated = teamService.updateTeam(id, team);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/players/{playerId}")
    public ResponseEntity<Team> addPlayer(@PathVariable String teamId, @PathVariable String playerId) {
        Team updated = teamService.addPlayerToTeam(teamId, playerId);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{teamId}/players/{playerId}")
    public ResponseEntity<Team> removePlayer(@PathVariable String teamId, @PathVariable String playerId) {
        Team updated = teamService.removePlayerFromTeam(teamId, playerId);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }
}
