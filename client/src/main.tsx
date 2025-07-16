import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Error boundary for icon import issues
try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error("App startup error:", error);
  // Fallback UI in case of critical startup issues
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1a1a1a, #2d1b3d); color: white; font-family: system-ui;">
        <div style="text-align: center;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">CAREERATE Loading...</h1>
          <p>Initializing application...</p>
        </div>
      </div>
    `;
  }
}
