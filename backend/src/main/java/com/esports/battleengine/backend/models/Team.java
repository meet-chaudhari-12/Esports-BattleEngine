package com.esports.battleengine.backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "teams")
public class Team {

    @Id
    private String id;

    @NotBlank(message = "Team name is required")
    private String name;

    private String org;

    private String region;

    private List<String> playerIds = new ArrayList<>();

    private Integer rank;

    private String coach;
}
