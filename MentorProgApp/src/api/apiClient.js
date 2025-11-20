// MentorProgApp/src/api/apiClient.js
import axios from "axios";

// 👉 Incluimos /api aquí, para no repetirlo en todas las llamadas
const BASE_URL = "http://192.168.1.69:3000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default apiClient;
