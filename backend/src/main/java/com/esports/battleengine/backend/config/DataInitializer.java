package com.esports.battleengine.backend.config;

import com.esports.battleengine.backend.models.GameType;
import com.esports.battleengine.backend.models.GameRule;
import com.esports.battleengine.backend.models.ScoringType;
import com.esports.battleengine.backend.models.Tournament;
import com.esports.battleengine.backend.repositories.GameRuleRepository;
import com.esports.battleengine.backend.repositories.TournamentRepository;
import com.esports.battleengine.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            GameRuleRepository ruleRepository,
            TournamentRepository tournamentRepository,
            UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return args -> {
            // ── SEED USERS ──
            if (userRepository.count() == 0) {
                // Demo Player
                userRepository.save(com.esports.battleengine.backend.models.User.builder()
                        .username("player")
                        .email("player@demo.com")
                        .password(encoder.encode("password"))
                        .roles(java.util.Set.of(com.esports.battleengine.backend.models.Role.PLAYER))
                        .build());

                // Demo Organizer
                userRepository.save(com.esports.battleengine.backend.models.User.builder()
                        .username("organizer")
                        .email("org@demo.com")
                        .password(encoder.encode("password"))
                        .roles(java.util.Set.of(com.esports.battleengine.backend.models.Role.ORGANIZER))
                        .build());

                System.out.println("✅ Seeded Demo Users: player/password & organizer/password");
            }

            // ── SEED GAME RULES ──
            if (ruleRepository.count() == 0) {
                // ... (rest of the rules)
                // BGMI
                ruleRepository.save(GameRule.builder()
                        .gameName("BGMI")
                        .fullName("Battlegrounds Mobile India")
                        .genre("Battle Royale")
                        .teamSize(4)
                        .teamsPerMatch(16)
                        .scoringType(ScoringType.PLACEMENT)
                        .icon("🔫")
                        .color("#f97316")
                        .gradient("linear-gradient(135deg, #1a0a00, #2d1a00)")
                        .ruleConfig(Map.of(
                                "killPoint", 1,
                                "placementPoints", Map.of(
                                        "1", 15, "2", 12, "3", 10, "4", 8, "5", 6
                                )
                        ))
                        .build());

                // Valorant
                ruleRepository.save(GameRule.builder()
                        .gameName("VALORANT")
                        .fullName("Valorant")
                        .genre("Tactical Shooter")
                        .teamSize(5)
                        .teamsPerMatch(2)
                        .scoringType(ScoringType.ROUND)
                        .icon("🎯")
                        .color("#ff4655")
                        .gradient("linear-gradient(135deg, #1f1212, #110909)")
                        .ruleConfig(Map.of("pointsPerRound", 1))
                        .build());

                // F1 23
                ruleRepository.save(GameRule.builder()
                        .gameName("F1_23")
                        .fullName("F1 23")
                        .genre("Racing")
                        .teamSize(1)
                        .teamsPerMatch(20)
                        .scoringType(ScoringType.PLACEMENT)
                        .icon("🏎️")
                        .color("#e10600")
                        .gradient("linear-gradient(135deg, #1a0000, #0a0000)")
                        .ruleConfig(Map.of(
                                "pointsSystem", Map.of(
                                        "1", 25, "2", 18, "3", 15, "4", 12, "5", 10
                                )
                        ))
                        .build());
            }

            if (tournamentRepository.count() == 0) {
                tournamentRepository.save(Tournament.builder()
                        .name("Pro Series Season 1")
                        .gameName("BGMI")
                        .gameType(GameType.BATTLE_ROYALE)
                        .gameIcon("🔫")
                        .status("LIVE")
                        .region("India")
                        .prizePool("5,00,000")
                        .description("The ultimate battle for glory. 16 top teams compete for the crown.")
                        .maxTeams(16)
                        .teamIds(List.of("Team Soul", "GodLike", "Global Esports", "Blind Esports"))
                        .startDate(LocalDateTime.now())
                        .locked(false)
                        .build());

                tournamentRepository.save(Tournament.builder()
                        .name("Valorant Challengers")
                        .gameName("VALORANT")
                        .gameType(GameType.ROUND_BASED)
                        .gameIcon("🎯")
                        .status("UPCOMING")
                        .region("South Asia")
                        .prizePool("2,50,000")
                        .description("Tactical precision meets high stakes. Who will dominate the spike?")
                        .maxTeams(8)
                        .teamIds(List.of("Velocity Gaming", "Revenant"))
                        .startDate(LocalDateTime.now().plusDays(2))
                        .locked(false)
                        .build());
            }
        };
    }
}
