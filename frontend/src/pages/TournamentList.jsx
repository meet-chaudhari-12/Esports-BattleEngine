import { useEffect, useState } from "react";
import api from "../api"; // axios instance

function TournamentList() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    api.get("/tournaments")
      .then(res => setTournaments(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tournaments</h2>

      <ul>
        {tournaments.map(t => (
          <li key={t.id}>
            {t.name} — {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TournamentList;
