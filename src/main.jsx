import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import StaffApp from "./StaffApp.jsx";
import "./styles/global.css";

// Two apps, one build: the family-facing companion at "/", inside the
// phone-frame mockup, and the staff dashboard at "/staff", full-width,
// no phone frame, same design tokens and stylesheet. Kept as one Vite
// project rather than two so both share localStorage (the "database")
// on the same origin, which two separate dev servers on different
// ports would not.
const isStaff = window.location.pathname.startsWith("/staff");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isStaff ? (
      <StaffApp />
    ) : (
      <div className="device-frame">
        <div className="device-notch" aria-hidden="true" />
        <App />
        <div className="device-home-indicator" aria-hidden="true" />
      </div>
    )}
  </React.StrictMode>
);
