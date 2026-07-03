import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      reverseOrder={true}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#1f2937",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          fontSize: "15px",
          direction: "rtl"
        }
      }}
    />
  </StrictMode>
);
