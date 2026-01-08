import { useState } from "react";
import api from "../api";

function CreateTournament() {
  const [name, setName] = useState("");

  const submit = () => {
    api.post("/tournaments", { name })
      .then(() => alert("Tournament created"))
      .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Tournament</h2>

      <input
        placeholder="Tournament name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <br /><br />
      <button onClick={submit}>Create</button>
    </div>
  );
}

export default CreateTournament;
