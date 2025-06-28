import React from "react";
import "./Sidebar.css";

// Passes in the setActivePage function from app.js
function Sidebar({ setActivePage }) {
  return (
    <div id="sidebar-Container"> {/* Sidebar Wrapper */}
      {/* Buttons Calling the passed in setActivePage function from app.js */}
      <button onClick={() => setActivePage("home")}>Home</button>
      <button onClick={() => setActivePage("settings")}>Settings</button>
      <button onClick={() => setActivePage("forecast")}>Weekly Forecast</button>
      <button onClick={() => setActivePage("compare")}>Compare Statistics</button>
    </div>
  );
}

export default Sidebar;
