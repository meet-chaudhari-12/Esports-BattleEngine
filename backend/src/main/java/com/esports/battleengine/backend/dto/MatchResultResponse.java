package com.esports.battleengine.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Full match result payload returned after a match is completed.
 * Contains per-team scores, winner info, and a ranked leaderboard for that match.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResultResponse {

    private String matchId;
    private String tournamentId;
    private String gameName;
    private Integer round;
    private LocalDateTime completedAt;

    /** Winner details */
    private String winnerTeamId;
    private String winnerTeamName;

    /** Per-team score entries, sorted highest → lowest */
    private List<MatchTeamScore> matchLeaderboard;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchTeamScore {
        private Integer rank;
        private String teamId;
        private String teamName;
        private Integer score;
        private boolean isWinner;
    }
}
