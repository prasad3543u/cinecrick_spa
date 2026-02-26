import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>

      {/* Public page */}
      <Route path="/" element={<Signup />} />

      {/* Protected page */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

    </Routes>
  );
}
