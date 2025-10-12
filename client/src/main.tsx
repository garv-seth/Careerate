import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializePWA } from "./lib/pwa";

// Initialize PWA features
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  initializePWA().catch(console.error);
}

createRoot(document.getElementById("root")!).render(<App />);
