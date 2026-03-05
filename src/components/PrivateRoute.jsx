import { Navigate } from "react-router-dom";
import { getToken } from "../lib/api";

export default function PrivateRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/" replace />;
  return children;
}