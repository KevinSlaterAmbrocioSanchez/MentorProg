// src/controllers/progresoController.js
import db from "../config/firebase.js";

export const obtenerProgresoUsuario = async (req, res) => {
  try {
    const userId = req.usuario.id;

    const progresoSnap = await db
      .collection("userProgress")
      .doc(userId)
      .collection("quizzes")
      .orderBy("fecha", "desc")
      .get();

    const progreso = progresoSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ progreso });
  } catch (error) {
    console.error("❌ Error en obtener progreso:", error);
    return res.status(500).json({
      mensaje: "Error al obtener progreso",
      error: error.message,
    });
  }
};
