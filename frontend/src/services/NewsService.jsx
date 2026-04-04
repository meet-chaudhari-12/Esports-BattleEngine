import api from "../api/axios";

export const getNews = () => api.get("/news");
