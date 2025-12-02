import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure light mode is set
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('light');
}

createRoot(document.getElementById("root")!).render(<App />);
