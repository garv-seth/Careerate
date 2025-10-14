import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializePWA } from "./lib/pwa";

// Initialize PWA features once
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Prevent duplicate registration caused by accidental double import
  if (!(window as any).__careerate_pwa_initialized) {
    (window as any).__careerate_pwa_initialized = true;
    initializePWA().catch(console.error);
  }
}

// Render app only once
const rootEl = document.getElementById("root")!;
if (!(rootEl as any).__mounted) {
  (rootEl as any).__mounted = true;
  createRoot(rootEl).render(<App />);
}
