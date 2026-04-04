package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.GameType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EngineFactory {

    private final Map<String, TournamentEngine> engines;

    public EngineFactory(Map<String, TournamentEngine> engines) {
        this.engines = engines;
    }

    public TournamentEngine getEngine(GameType gameType) {
        String engineName = gameType.name() + "_ENGINE";
        TournamentEngine engine = engines.get(engineName);
        if (engine == null) {
            throw new RuntimeException("No TournamentEngine found for GameType: " + gameType);
        }
        return engine;
    }
}
