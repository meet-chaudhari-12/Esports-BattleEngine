package com.esports.battleengine.backend.engine;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ScoringEngineFactory {

    private final Map<String, ScoringEngine> engines;

    public ScoringEngineFactory(Map<String, ScoringEngine> engines) {
        this.engines = engines;
    }

    public ScoringEngine getEngine(String gameName) {
        ScoringEngine engine = engines.get(gameName);
        if (engine == null) {
            throw new RuntimeException("No scoring engine found for game: " + gameName);
        }
        return engine;
    }
}
