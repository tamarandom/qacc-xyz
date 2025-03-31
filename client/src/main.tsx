import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the initial theme from localStorage if available
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

createRoot(document.getElementById("root")!).render(
  <App />
);
