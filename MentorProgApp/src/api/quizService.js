// src/api/quizService.js
import apiClient from "./apiClient";

// ==========================
// 📌 Crear quiz con Gemini (admin)
// ==========================
export const generarQuiz = async (token, payload) => {
  try {
    const res = await apiClient.post("/quizzes/gemini", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      mensaje: error?.response?.data?.mensaje || "Error al generar quiz",
    };
  }
};

// ==========================
// 📌 Enviar respuestas del quiz
// ==========================
export const enviarRespuestas = async (token, quizId, respuestas) => {
  try {
    const res = await apiClient.post(
      `/quizzes/${quizId}/submit`,
      { respuestas },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      mensaje: "Error al enviar respuestas",
    };
  }
};

// ==========================
// 📌 Obtener progreso del usuario
// ==========================
export const obtenerProgreso = async (token) => {
  try {
    const res = await apiClient.get("/progreso", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { ok: true, data: res.data.progreso || [] };
  } catch (error) {
    return {
      ok: false,
      mensaje: "Error al obtener progreso",
    };
  }
};
