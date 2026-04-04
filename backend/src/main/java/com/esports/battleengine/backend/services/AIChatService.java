package com.esports.battleengine.backend.services;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AIChatService {

    private final Map<String, String> knowledgeBase = new HashMap<>();

    public AIChatService() {
        // Initialize knowledge base
        knowledgeBase.put("tournament", "To join a tournament: 1. Browse 'Tournaments' from the menu. 2. Pick an event. 3. You must have a team & be logged in. 4. Click 'Join Tournament'.");
        knowledgeBase.put("create", "To host a tournament: 1. Log in as an Organizer. 2. Go to 'Tournaments'. 3. Click '+ Create Tournament'. 4. Set your rules, game, and prize pool!");
        knowledgeBase.put("host", "To host a tournament: 1. Log in as an Organizer. 2. Go to 'Tournaments'. 3. Click '+ Create Tournament'. 4. Set your rules, game, and prize pool!");
        knowledgeBase.put("team", "Team Management: 1. Go to 'Teams'. 2. Click 'Create Team' to start your own. 3. Or browse existing teams to send a 'Join Request'. Managers can accept/reject requests in their dashboard.");
        knowledgeBase.put("match", "Match Operations: - Go to 'Matches' to see your schedule. - Organizers can click 'Submit Result' to record scores. - Click 'View Results' on any match to see the detailed scorecard!");
        knowledgeBase.put("result", "Match Operations: - Go to 'Matches' to see your schedule. - Organizers can click 'Submit Result' to record scores. - Click 'View Results' on any match to see the detailed scorecard!");
        knowledgeBase.put("score", "Match Operations: - Go to 'Matches' to see your schedule. - Organizers can click 'Submit Result' to record scores. - Click 'View Results' on any match to see the detailed scorecard!");
        knowledgeBase.put("dashboard", "Your Dashboard shows your active tournaments, upcoming matches, and quick stats. Access it anytime from the sidebar/menu!");
        knowledgeBase.put("login", "Click 'Sign In' or 'Join Now' in the top right. You can choose to be a 'Player' (to compete) or an 'Organizer' (to run events).");
        knowledgeBase.put("register", "Click 'Sign In' or 'Join Now' in the top right. You can choose to be a 'Player' (to compete) or an 'Organizer' (to run events).");
        knowledgeBase.put("role", "Users can be Players or Organizers. Organizers create and manage events, while Players join teams and compete in tournaments.");
        knowledgeBase.put("news", "Check the 'News' section for the latest esports updates from Cricket, FIFA, Valorant, and more!");
        knowledgeBase.put("hello", "Hello player! I am BattleBot, your guide to this platform. How can I assist you today?");
        knowledgeBase.put("help", "I can help with: 1. Joining Tournaments 2. Creating Teams 3. Managing Matches 4. Account Settings 5. Navigation. What do you need help with?");
    }

    public String processRequest(String message) {
        if (message == null || message.isBlank()) {
            return "I didn't quite catch that. Could you please rephrase?";
        }

        String lowerMessage = message.toLowerCase();
        
        // Find the best match in knowledge base
        for (String key : knowledgeBase.keySet()) {
            if (lowerMessage.contains(key)) {
                return knowledgeBase.get(key);
            }
        }

        return "I'm still learning about " + message + ". I'm specialized in BattleEngine operations! Try asking 'How do I join a tournament?' or 'How to create a team?'";
    }
}
