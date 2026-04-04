import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getNews } from "../services/NewsService";

function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await getNews();
                setNews(response.data);
            } catch (err) {
                console.error("Error fetching news:", err);
                setError("Failed to load latest news. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <Navbar />

            <div style={{ paddingTop: "80px", position: "relative", zIndex: 1 }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 24px" }}>

                    <div style={{ marginBottom: "2.5rem" }}>
                        <h1 style={{
                            fontFamily: "'Exo 2', sans-serif",
                            fontSize: "2.5rem",
                            fontWeight: 900,
                            color: "#fff",
                            marginBottom: "0.5rem",
                            textTransform: "uppercase",
                            letterSpacing: "-0.02em"
                        }}>
                            Latest <span style={{ color: "var(--primary)" }}>eSports</span> News
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem" }}>
                            Stay updated with the latest happenings in the gaming world.
                        </p>
                    </div>

                    {loading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={{
                                    background: "var(--bg-card)",
                                    borderRadius: "20px",
                                    height: "400px",
                                    border: "1px solid var(--border)",
                                    animation: "pulse 1.5s ease infinite"
                                }} />
                            ))}
                        </div>
                    ) : error ? (
                        <div style={{
                            padding: "3rem",
                            textAlign: "center",
                            background: "rgba(239, 68, 68, 0.1)",
                            borderRadius: "20px",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#ef4444"
                        }}>
                            {error}
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                            {news.map((article, index) => (
                                <article
                                    key={index}
                                    style={{
                                        background: "var(--bg-card)",
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        border: "1px solid var(--border)",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%",
                                        cursor: "pointer"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "translateY(-10px)";
                                        e.currentTarget.style.borderColor = "rgba(249, 115, 22, 0.4)";
                                        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.borderColor = "var(--border)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", overflow: "hidden" }}>
                                        <img
                                            src={article.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"}
                                            alt={article.title}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover"
                                            }}
                                        />
                                        <div style={{
                                            position: "absolute",
                                            bottom: "0",
                                            left: "0",
                                            right: "0",
                                            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                            padding: "1rem"
                                        }}>
                                            <span style={{
                                                background: "var(--primary)",
                                                color: "white",
                                                fontSize: "0.7rem",
                                                fontWeight: 700,
                                                padding: "4px 10px",
                                                borderRadius: "50px",
                                                textTransform: "uppercase"
                                            }}>
                                                {article.sourceName}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>
                                            {new Date(article.publishedAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </div>
                                        <h2 style={{
                                            fontSize: "1.25rem",
                                            fontWeight: 800,
                                            color: "#fff",
                                            marginBottom: "1rem",
                                            lineHeight: "1.4",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}>
                                            {article.title}
                                        </h2>
                                        <p style={{
                                            fontSize: "0.9rem",
                                            color: "rgba(255,255,255,0.6)",
                                            lineHeight: "1.6",
                                            marginBottom: "1.5rem",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            flex: 1
                                        }}>
                                            {article.description}
                                        </p>
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: "0.8rem 1.2rem",
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "12px",
                                                color: "#fff",
                                                textDecoration: "none",
                                                textAlign: "center",
                                                fontSize: "0.9rem",
                                                fontWeight: 700,
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = "var(--primary)";
                                                e.currentTarget.style.borderColor = "var(--primary)";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                            }}
                                        >
                                            Read Full Article
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}

export default News;
