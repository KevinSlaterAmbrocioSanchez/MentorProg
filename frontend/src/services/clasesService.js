import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listarClases = () =>
  axios.get(`${API}/clases`, { headers: authHeaders() }).then(r => r.data);
