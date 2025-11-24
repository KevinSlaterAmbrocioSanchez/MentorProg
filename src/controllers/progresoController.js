// src/controllers/progresoController.js
import db from "../config/firebase.js";

export const obtenerProgresoUsuario = async (req, res) => {
  try {
    const usuario = req.usuario || {};
    const userId = usuario.id || usuario.uid || usuario.email || null;

    if (!userId) {
      return res
        .status(401)
        .json({ mensaje: "No se pudo identificar al usuario en el token" });
    }

    // Ahora el progreso se toma de la colección global intentosQuiz
    const snap = await db
      .collection("intentosQuiz")
      .where("userId", "==", userId)
      .get();

    const progreso = [];

    snap.forEach((doc) => {
      const d = doc.data();
          rogreso.push({
        id: doc.id,
        materiaId: d.materiaId || null,
        temaId: d.temaId || null,
        subtemaId: d.subtemaId || null,
        subtemaTitulo: d.subtemaTitulo || null,
        quizId: d.quizId || null,
        correctas: d.aciertos ?? 0,          // 👈 nombre que usa la app
        total: d.totalPreguntas ?? 0,        // 👈 nombre que usa la app
        porcentaje: d.porcentaje ?? 0,
        fecha: d.fecha || null,
      });
    });

    // Ordenar por fecha descendente
    progreso.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

    return res.json({ progreso });
  } catch (error) {
    console.error("❌ Error en obtener progreso:", error);
    return res.status(500).json({
      mensaje: "Error al obtener progreso",
      error: error.message,
    });
  }
};
