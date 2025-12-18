package com.esports.battleengine.backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "matches")
public class Match {

    @Id
    private String id;

    private String tournamentId;

    private String teamAId;
    private String teamBId;

    private Integer scoreA;
    private Integer scoreB;

    private LocalDateTime scheduledAt;

    private String winnerTeamId;

    private String status;
}
