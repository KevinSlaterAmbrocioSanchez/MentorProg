// MentorProgApp/src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // 🔹 Cargar sesión guardada al abrir la app
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const tokenGuardado = await AsyncStorage.getItem("token");
        const usuarioGuardado = await AsyncStorage.getItem("usuario");

        if (tokenGuardado) {
          setToken(tokenGuardado);
        }
        if (usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.log("Error cargando sesión:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarSesion();
  }, []);

  // 🔹 LOGIN: aquí SÍ se hace la petición al backend
  const login = async (email, password) => {
    try {
      setCargando(true);

      const respuesta = await apiClient.post(
        "/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Respuesta login:", respuesta.data);

      const { token, usuario } = respuesta.data;

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("usuario", JSON.stringify(usuario));

      // Guardar en contexto
      setToken(token);
      setUsuario(usuario);
    } catch (error) {
      console.log(
        "Error en login:",
        error.response?.data || error.message
      );
      // Re-lanzamos para que la pantalla pueda mostrar el Alert
      throw error;
    } finally {
      setCargando(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, usuario, cargando, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
