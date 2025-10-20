import React, { createContext, useState, useEffect } from "react";
import { getPerfil } from "../services/authService";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getPerfil()
  .then((data) => {
    setUsuario(data);
  })
  .catch(() => {
    localStorage.removeItem("token");
    Swal.fire({
      icon: "warning",
      title: "Sesión expirada",
      text: "Por favor inicia sesión nuevamente",
    }).then(() => {
      window.location.href = "/"; // redirige al login
    });
  })
  .finally(() => setCargando(false));

    } else {
      setCargando(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}
