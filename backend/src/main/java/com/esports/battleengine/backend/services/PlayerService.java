package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.models.Player;
import com.esports.battleengine.backend.repositories.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public Player createPlayer(Player player) {
        return playerRepository.save(player);
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player getPlayerById(String id) {
        return playerRepository.findById(id).orElse(null);
    }

    public Player updatePlayer(String id, Player updatedPlayer) {
        Player existing = getPlayerById(id);
        if (existing == null) return null;

        existing.setName(updatedPlayer.getName());
        existing.setInGameName(updatedPlayer.getInGameName());
        existing.setRole(updatedPlayer.getRole());
        existing.setCountry(updatedPlayer.getCountry());
        existing.setAge(updatedPlayer.getAge());
        existing.setTeamId(updatedPlayer.getTeamId());

        return playerRepository.save(existing);
    }

    public void deletePlayer(String id) {
        playerRepository.deleteById(id);
    }
}
