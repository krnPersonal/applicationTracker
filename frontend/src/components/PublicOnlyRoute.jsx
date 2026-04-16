import { Navigate } from "react-router-dom";
import { getToken } from "../Api/Client.js";

export default function PublicOnlyRoute({ children }) {
  const token = getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
