package com.esports.battleengine.backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tournaments")
public class Tournament {

    @Id
    private String id;

    private String name;

    private String game;

    private String organizerId;

    private String format;

    private Integer maxTeams;

    private List<String> teamIds;

    private LocalDateTime startDate;

    private String status;

    private Boolean locked;
}
