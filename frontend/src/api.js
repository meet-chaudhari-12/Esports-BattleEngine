import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  auth: {
    username: "admin",
    password: "admin123"
  }
});

export default api;
