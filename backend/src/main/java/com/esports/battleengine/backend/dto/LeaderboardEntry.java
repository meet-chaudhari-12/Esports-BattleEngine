package com.esports.battleengine.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntry {

    private String teamId;
    private Integer totalScore;
    private Integer rank;
}
