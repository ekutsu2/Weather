import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./styles.css";

console.log("index.js is being executed");

// Get the root element
const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

// Render the App inside root
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log("Root created, rendering App");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
