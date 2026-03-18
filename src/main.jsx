import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: "#18181b",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#fff",
    },
    success: {
      icon: <CheckCircle className="h-4 w-4 text-green-400" />,
    },
    error: {
      icon: <AlertCircle className="h-4 w-4 text-red-400" />,
    },
    info: {
      icon: <Info className="h-4 w-4 text-blue-400" />,
    },
  }}
/>

      <App />
    </BrowserRouter>
  </StrictMode>
);