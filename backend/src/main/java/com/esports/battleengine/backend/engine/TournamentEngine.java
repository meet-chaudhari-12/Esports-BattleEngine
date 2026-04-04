package com.esports.battleengine.backend.engine;

import com.esports.battleengine.backend.models.Match;
import com.esports.battleengine.backend.models.Tournament;

import java.util.Map;

public interface TournamentEngine {

    void generateMatches(Tournament tournament);

    void processMatchResult(Match match, Map<String, Object> result);

    void advanceWinner(Match match);
}
