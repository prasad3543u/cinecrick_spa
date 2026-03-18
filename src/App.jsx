import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Grounds from "./pages/Grounds";
import GroundDetails from "./pages/GroundDetails";
import MyBookings from "./pages/MyBookings";
import AdminGrounds from "./pages/AdminGrounds";
import AdminSlots from "./pages/AdminSlots";
import AdminBookings from "./pages/AdminBookings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminToday from "./pages/AdminToday";
import UserProfile from "./pages/UserProfile";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AdminUsers from "./pages/AdminUsers";
import Settings from "./pages/Settings";
import MainLayout from "./layouts/MainLayout";    

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes with Layout */}
      <Route path="/home" element={
        <PrivateRoute>
          <MainLayout>
            <Home />
          </MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/grounds" element={
        <PrivateRoute>
          <MainLayout>
            <Grounds />
          </MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/grounds/:id" element={
        <PrivateRoute>
          <MainLayout>
            <GroundDetails />
          </MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/my-bookings" element={
        <PrivateRoute>
          <MainLayout>
            <MyBookings />
          </MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <MainLayout>
            <UserProfile />
          </MainLayout>
        </PrivateRoute>
      } />
      
      <Route path="/settings" element={
        <PrivateRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </PrivateRoute>
      } />

      {/* Admin Routes with Layout */}
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <MainLayout>
            <AdminDashboard />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/grounds" element={
        <AdminRoute>
          <MainLayout>
            <AdminGrounds />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/slots" element={
        <AdminRoute>
          <MainLayout>
            <AdminSlots />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/bookings" element={
        <AdminRoute>
          <MainLayout>
            <AdminBookings />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/users" element={
        <AdminRoute>
          <MainLayout>
            <AdminUsers />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/today" element={
        <AdminRoute>
          <MainLayout>
            <AdminToday />
          </MainLayout>
        </AdminRoute>
      } />

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}