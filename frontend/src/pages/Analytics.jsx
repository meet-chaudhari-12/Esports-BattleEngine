import React from 'react';

const Analytics = () => {
    // Mock Data for Analytics
    const leaderboard = [
        { rank: 1, team: 'Team Liquid', score: 2450, winRate: '85%' },
        { rank: 2, team: 'Cloud9', score: 2300, winRate: '78%' },
        { rank: 3, team: 'Sentinels', score: 2150, winRate: '72%' },
        { rank: 4, team: 'G2 Esports', score: 2100, winRate: '70%' },
        { rank: 5, team: 'Fnatic', score: 1950, winRate: '65%' },
    ];

    return (
        <div className="container page-analytics">
            <h1 className="page-title">Global <span className="text-gradient">Leaderboard</span></h1>

            <div className="glass-panel table-container">
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>Win Rate</th>
                            <th style={{ textAlign: 'right' }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry) => (
                            <tr key={entry.rank}>
                                <td className="rank-cell">#{entry.rank}</td>
                                <td className="team-cell">{entry.team}</td>
                                <td>{entry.winRate}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{entry.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
        .page-analytics { padding-top: 2rem; }
        .page-title { margin-bottom: 2rem; font-size: 2rem; }
        .table-container { padding: 1rem; }
        
        .analytics-table {
          width: 100%;
          border-collapse: collapse;
        }
        .analytics-table th, .analytics-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
        }
        .analytics-table th {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .analytics-table tr:last-child td {
          border-bottom: none;
        }
        .rank-cell {
          font-family: monospace;
          color: var(--text-tertiary);
        }
        .team-cell {
          font-weight: 600;
        }
        .analytics-table tr:hover {
          background: rgba(255,255,255,0.02);
        }
      `}</style>
        </div>
    );
};

export default Analytics;
