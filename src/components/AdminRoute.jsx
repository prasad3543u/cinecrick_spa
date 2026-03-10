import { Navigate } from "react-router-dom";
import { getToken } from "../lib/api";

export default function AdminRoute({ children }) {
  const token = getToken();
  const user = JSON.parse(localStorage.getItem("cinecrick_user") || "{}");

  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== "admin") return <Navigate to="/home" replace />;

  return children;
}