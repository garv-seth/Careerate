import { createRoot } from "react-dom/client";
import "./index.css";

function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">CAREERATE Test</h1>
        <p className="text-lg mb-8">Testing app startup without problematic imports</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);