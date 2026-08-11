import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="device-frame">
      <div className="device-notch" aria-hidden="true" />
      <App />
      <div className="device-home-indicator" aria-hidden="true" />
    </div>
  </React.StrictMode>
);
