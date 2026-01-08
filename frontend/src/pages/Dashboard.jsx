import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Esports BattleEngine</h1>

      <ul>
        <li><Link to="/tournaments">View Tournaments</Link></li>
        <li><Link to="/create-tournament">Create Tournament</Link></li>
        <li><Link to="/teams">Teams</Link></li>
        <li><Link to="/matches">Matches</Link></li>
      </ul>
    </div>
  );
}

export default Dashboard;
