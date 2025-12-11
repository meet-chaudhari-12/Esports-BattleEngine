package com.esports.battleengine.backend.services;

import com.esports.battleengine.backend.models.Team;
import com.esports.battleengine.backend.repositories.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {

    private final TeamRepository teamRepository;

    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(String id) {
        return teamRepository.findById(id).orElse(null);
    }

    public Team updateTeam(String id, Team updated) {
        Optional<Team> opt = teamRepository.findById(id);
        if (opt.isEmpty()) return null;

        Team team = opt.get();

        team.setName(updated.getName());
        team.setOrg(updated.getOrg());
        team.setRegion(updated.getRegion());
        team.setRank(updated.getRank());
        team.setCoach(updated.getCoach());

        if (updated.getPlayerIds() != null) {
            team.setPlayerIds(updated.getPlayerIds());
        }

        return teamRepository.save(team);
    }

    public void deleteTeam(String id) {
        teamRepository.deleteById(id);
    }

    public Team addPlayerToTeam(String teamId, String playerId) {
        Team team = getTeamById(teamId);
        if (team == null) return null;

        if (!team.getPlayerIds().contains(playerId)) {
            team.getPlayerIds().add(playerId);
        }

        return teamRepository.save(team);
    }

    public Team removePlayerFromTeam(String teamId, String playerId) {
        Team team = getTeamById(teamId);
        if (team == null) return null;

        team.getPlayerIds().removeIf(id -> id.equals(playerId));

        return teamRepository.save(team);
    }
}
