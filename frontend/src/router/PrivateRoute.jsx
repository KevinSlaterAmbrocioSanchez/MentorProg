// src/router/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { usuario, cargando } = useContext(AuthContext);
  const location = useLocation();

  if (cargando) {
    return <div style={{ padding: 24 }}>Cargando sesión...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
