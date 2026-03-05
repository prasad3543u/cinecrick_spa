import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {

  const userStr = localStorage.getItem("cinecrick_user");
  const loggedIn = localStorage.getItem("cinecrick_logged_in");

  if (!userStr || loggedIn !== "true") {
    return <Navigate to="/" replace />;
  }

  try {
    JSON.parse(userStr);
  } catch {
    localStorage.removeItem("cinecrick_user");
    localStorage.removeItem("cinecrick_logged_in");
    return <Navigate to="/" replace />;
  }

  return children;
}