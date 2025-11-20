// frontend/src/services/materiasService.js
import axios from "axios";

const API_URL = "http://localhost:3000/subjects";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Obtener todas las materias
export const getSubjects = async () => {
  const res = await axios.get(API_URL, authHeader());
  return res.data;
};

// Crear una materia
export const createSubject = async (subjectData) => {
  const res = await axios.post(API_URL, subjectData, authHeader());
  return res.data;
};
