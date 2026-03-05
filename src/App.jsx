import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>
      {/* ✅ Default page = Login */}
      <Route path="/" element={<Login />} />

      {/* Signup page */}
      <Route path="/signup" element={<Signup />} />

      {/* Protected Home */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* Any unknown route → Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}