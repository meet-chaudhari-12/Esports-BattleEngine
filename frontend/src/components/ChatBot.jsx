import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Welcome to BattleEngine! ⚡ I'm your AI guide. How can I help you dominate the arena today?" }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        try {
            // Call backend AI engine
            const res = await api.post("/ai/chat", { message: input });
            const botResponse = res.data.response || "I'm having trouble processing that right now.";

            setMessages(prev => [...prev, { role: "assistant", content: botResponse }]);
        } catch (err) {
            console.error("AI Assistant Error:", err);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Oops! My connection to the central engine was interrupted. Please try again in a moment. ⚡"
            }]);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000, fontFamily: "var(--font-body)" }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: "absolute", bottom: "80px", right: "0",
                    width: "350px", height: "500px",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "24px", display: "flex", flexDirection: "column",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)", overflow: "hidden",
                    animation: "slideUp 0.3s ease"
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "20px", background: "var(--grad-primary)",
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>⚡</div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "white" }}>BattleBot AI</div>
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)" }}>Platform Guide • Online</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem", padding: "5px" }}>×</button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                                maxWidth: "80%", padding: "12px 16px", borderRadius: "16px",
                                fontSize: "0.9rem", lineHeight: "1.5",
                                background: m.role === "user" ? "var(--primary)" : "var(--bg-elevated)",
                                color: "white",
                                border: m.role === "user" ? "none" : "1px solid var(--border)",
                                borderBottomRightRadius: m.role === "user" ? "4px" : "16px",
                                borderBottomLeftRadius: m.role === "assistant" ? "4px" : "16px",
                            }}>
                                {m.content.split('\n').map((line, j) => <div key={j}>{line}</div>)}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: "15px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid var(--border)", display: "flex", gap: "10px" }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1, background: "var(--bg-base)", border: "1px solid var(--border)",
                                borderRadius: "12px", padding: "10px 15px", color: "white", outline: "none", fontSize: "0.85rem"
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                width: "40px", height: "40px", borderRadius: "12px",
                                background: "var(--grad-primary)", border: "none", color: "white",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >
                            🚀
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "65px", height: "65px", borderRadius: "50%",
                    background: "var(--grad-primary)", border: "none",
                    boxShadow: "0 8px 25px var(--primary-glow)", color: "white",
                    fontSize: "1.8rem", cursor: "pointer", transition: "all 0.3s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0)"
                }}
            >
                {isOpen ? "×" : "💬"}
            </button>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

export default ChatBot;
