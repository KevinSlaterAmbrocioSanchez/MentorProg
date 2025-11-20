// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { login as loginService } from "../services/authService";

export const AuthContext = createContext(null);

// 👇 Función para decodificar el JWT sin librerías extras
const decodeToken = (token) => {
  try {
    const [, payloadBase64] = token.split(".");
    const json = atob(payloadBase64);
    const payload = JSON.parse(json);

    return {
      id: payload.id,
      nombre: payload.nombre,
      email: payload.email,
      rol: payload.rol, // admin / usuario
    };
  } catch (err) {
    console.error("Error al decodificar token:", err);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al recargar la página, leer el token guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCargando(false);
      return;
    }

    const info = decodeToken(token);
    if (info) {
      setUsuario(info);
    } else {
      localStorage.removeItem("token");
    }
    setCargando(false);
  }, []);

  // 👇 Login que:
  // 1) llama al backend
  // 2) guarda token
  // 3) decodifica token y llena `usuario`
  const login = async (email, password) => {
    try {
      const data = await loginService(email, password); // { token, mensaje }
      const { token } = data;

      localStorage.setItem("token", token);

      const info = decodeToken(token);
      if (!info) {
        console.error("No se pudo decodificar el token");
        return false;
      }

      setUsuario(info);
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
