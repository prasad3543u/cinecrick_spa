import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Grounds from "./pages/Grounds";
import GroundDetails from "./pages/GroundDetails";
import MyBookings from "./pages/MyBookings";
import AdminGrounds from "./pages/AdminGrounds";
import AdminSlots from "./pages/AdminSlots";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>
      {/* Default page = Login */}
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

      {/* Grounds list */}
      <Route
        path="/grounds"
        element={
          <PrivateRoute>
            <Grounds />
          </PrivateRoute>
        }
      />

      {/* Ground details */}
      <Route
        path="/grounds/:id"
        element={
          <PrivateRoute>
            <GroundDetails />
          </PrivateRoute>
        }
      />

      {/* My bookings */}
      <Route
        path="/my-bookings"
        element={
          <PrivateRoute>
            <MyBookings />
          </PrivateRoute>
        }
      />

      {/* Admin grounds */}
      <Route
        path="/admin/grounds"
        element={
          <PrivateRoute>
            <AdminGrounds />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/slots"
        element={
          <PrivateRoute>
            <AdminSlots />
          </PrivateRoute>
        }
      />

      {/* Any unknown route → Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}