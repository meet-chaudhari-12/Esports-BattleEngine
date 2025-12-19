package com.esports.battleengine.backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "matches")
public class Match {

    @Id
    private String id;
    private String tournamentId;
    private String game;                  // REQUIRED
    private List<String> teamIds;          // multi-team ready
    private Map<String, Object> rawResult; // input
    private Map<String, Integer> finalScore; // output
    private LocalDateTime scheduledAt;
    private MatchStatus status;                 // SCHEDULED, COMPLETED

}
