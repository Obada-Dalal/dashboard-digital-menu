import axios from "axios";

const api = axios.create({
  baseURL: "https://server-digital-menu.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
