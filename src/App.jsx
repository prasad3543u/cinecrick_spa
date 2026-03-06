import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Grounds from "./pages/Grounds";
import GroundDetails from "./pages/GroundDetails";
import MyBookings from "./pages/MyBookings";
import AdminGrounds from "./pages/AdminGrounds";
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
      <Route path="/grounds" element={<Grounds />} />
<Route path="/grounds/:id" element={<GroundDetails />} />
<Route path="/my-bookings" element={<MyBookings />} />
<Route path="/admin/grounds" element={<AdminGrounds />} />

      {/* Any unknown route → Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}