import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {

  const user = localStorage.getItem("cinecrick_user");

  if (!user) {
    alert("Please register first!");
    return <Navigate to="/" replace />;
  }

  return children;
}
