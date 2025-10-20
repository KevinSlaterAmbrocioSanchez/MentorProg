import axios from "axios";

const API_URL = "http://localhost:3000/auth";

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  const token = res.data.token;

  // Guardar el token en localStorage
  localStorage.setItem("token", token);

  // Decodificar token (para extraer nombre, email y rol)
  const payload = JSON.parse(atob(token.split(".")[1]));

  return {
    token,
    usuario: {
      nombre: payload.nombre || "Sin nombre",
      email: payload.email,
      rol: payload.rol,
    },
  };
};
// =======================================
// 🔹 Obtener perfil decodificando el token
// =======================================
export const getPerfil = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token disponible");

  // Hacemos una pequeña validación con el backend (verifica si el token sigue siendo válido)
  try {
    await axios.get("http://localhost:3000/protected/perfil", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Token inválido o expirado");
  }

  // Decodificamos el token JWT
  const payload = JSON.parse(atob(token.split(".")[1]));

  return {
    nombre: payload.nombre || "Sin nombre",
    email: payload.email,
    rol: payload.rol,
  };
};

