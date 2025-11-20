// src/api/materiasService.js
import apiClient from "./apiClient";

export const obtenerMaterias = async (token) => {
  try {
    const res = await apiClient.get("/materias", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { ok: true, materias: res.data };
  } catch (error) {
    console.error("❌ Error al obtener materias:", error?.response?.data || error);
    return { ok: false, mensaje: "Error al obtener materias" };
  }
};
// agregar dentro de materiasService.js
export const obtenerTemasDeMateria = async (token, materiaId) => {
  try {
    const res = await apiClient.get(`/materias/${materiaId}/temas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data || {};
    const temas = Array.isArray(data.temas) ? data.temas : [];

    return { ok: true, temas };
  } catch (error) {
    console.error(
      "❌ Error al obtener temas de la materia:",
      error?.response?.data || error.message
    );
    return {
      ok: false,
      mensaje: "Error al obtener temas",
    };
  }
};
