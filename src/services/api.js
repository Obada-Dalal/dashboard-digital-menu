import axios from "axios";

const api = axios.create({
  baseURL: "https://server-digital-menu.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api"
//   // بدون Content-Type - خلي axios يحدد تلقائياً
// });

// export default api;
