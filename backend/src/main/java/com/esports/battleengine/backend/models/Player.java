package com.esports.battleengine.backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "players")
public class Player {

    @Id
    private String id;

    private String name;
    private String inGameName;
    private String role;
    private String country;
    private Integer age;
    private String teamId;
}
