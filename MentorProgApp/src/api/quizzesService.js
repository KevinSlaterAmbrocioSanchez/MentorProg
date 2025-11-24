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
 * Obtiene un quiz por ID (solo si tienes endpoint /quizzes/:quizId en el backend).
 */
export const obtenerQuizPorId = async (token, quizId) => {
  try {
    const res = await apiClient.get(`/quizzes/${quizId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const quiz = res.data || null;
    return { ok: true, quiz };
  } catch (error) {
    console.error(
      "❌ Error al obtener quiz por ID:",
      error?.response?.data || error.message
    );
    return {
      ok: false,
      mensaje: "Error al obtener quiz",
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
      status: error.response?.status,
      intentoPrevio: error.response?.data?.intentoPrevio || null,
      mensaje:
        error.response?.data?.mensaje ||
        "Error al enviar respuestas del quiz",
    };
  }
};

/**
 * 🔎 Nuevo: obtiene, desde /progreso, si el usuario YA hizo ese quiz.
 * Devuelve el intento si existe.
 */
export const obtenerIntentoUsuarioQuiz = async (token, quizId) => {
  try {
    const res = await apiClient.get("/progreso", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data || {};
    const lista = Array.isArray(data.progreso) ? data.progreso : [];

    const intento = lista.find((item) => item.quizId === quizId);

    if (!intento) {
      return { ok: false, codigo: "SIN_INTENTO" };
    }

    return { ok: true, intento };
  } catch (error) {
    console.error(
      "❌ Error al verificar intento de quiz:",
      error.response?.data || error.message
    );
    return {
      ok: false,
      codigo: "ERROR",
      mensaje: "Error al verificar si ya hiciste este quiz",
    };
  }
};
