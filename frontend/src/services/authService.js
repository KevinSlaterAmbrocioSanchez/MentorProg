// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:3000";

// Login: devuelve { token, mensaje }
export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};
