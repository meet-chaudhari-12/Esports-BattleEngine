import api from "../api/axios";

export const getTournaments = () =>
  api.get("/tournaments");

export const createTournament = (data) =>
  api.post("/tournaments", data);

export const deleteTournament = (id) =>
  api.delete(`/tournaments/${id}`);
