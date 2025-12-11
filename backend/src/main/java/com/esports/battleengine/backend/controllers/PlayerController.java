package com.esports.battleengine.backend.controllers;

import com.esports.battleengine.backend.models.Player;
import com.esports.battleengine.backend.services.PlayerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping
    public Player create(@RequestBody Player player) {
        return playerService.createPlayer(player);
    }

    @GetMapping
    public List<Player> getAll() {
        return playerService.getAllPlayers();
    }

    @GetMapping("/{id}")
    public Player getById(@PathVariable String id) {
        return playerService.getPlayerById(id);
    }

    @PutMapping("/{id}")
    public Player update(@PathVariable String id, @RequestBody Player player) {
        return playerService.updatePlayer(id, player);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        playerService.deletePlayer(id);
    }
}
