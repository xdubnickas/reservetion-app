//import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

document.body.classList.add("light"); // Nastavíme predvolený režim na 'dark'

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
