package com.esports.battleengine.backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "join_requests")
public class JoinRequest {

    @Id
    private String id;

    private String teamId;
    private String userId;       // the user who wants to join
    private String username;     // display name for convenience

    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime respondedAt;
}
