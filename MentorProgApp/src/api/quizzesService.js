// MentorProgApp/src/api/quizzesService.js
import apiClient from "./apiClient";

/**
 * Obtiene los quizzes de un tema específico.
 */
export const obtenerQuizzesDeTema = async (
  token,
  materiaId,
  temaId,
  subtemaTitulo = null
) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    if (subtemaTitulo) {
      config.params = { subtemaTitulo };
    }

    const res = await apiClient.get(
      `/materias/${materiaId}/temas/${temaId}/quizzes`,
      config
    );

    const data = res.data || {};
    const quizzes = Array.isArray(data.quizzes) ? data.quizzes : data;

    return { ok: true, quizzes };
  } catch (error) {
    console.error(
      "❌ Error al obtener quizzes del tema:",
      error?.response?.data || error.message
    );
    return {
      ok: false,
      mensaje: "Error al obtener quizzes del tema",
    };
  }
};

/**
 * Envía respuestas de un quiz para que el backend lo califique.
 */
export const enviarRespuestasQuiz = async (
  token,
  quizId,
  respuestas,
  meta = {}
) => {
  try {
    const { materiaId, temaId, subtemaTitulo } = meta;

    const res = await apiClient.post(
      `/quizzes/${quizId}/submit`,
      {
        respuestas,
        materiaId: materiaId || null,
        temaId: temaId || null,
        subtemaTitulo: subtemaTitulo || null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      ok: true,
      resultado: res.data,
    };
  } catch (error) {
    console.error(
      "❌ Error al enviar respuestas del quiz:",
      error.response?.data || error.message
    );
    return {
      ok: false,
      mensaje:
        error.response?.data?.mensaje ||
        "Error al enviar respuestas del quiz",
    };
  }
};
