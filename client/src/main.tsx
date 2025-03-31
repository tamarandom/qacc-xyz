import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./contexts/theme-context";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
