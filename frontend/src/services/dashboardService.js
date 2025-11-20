import axios from "axios";

const API_URL = "http://localhost:3000/protected";

export const getDashboardData = async (token) => {
  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
