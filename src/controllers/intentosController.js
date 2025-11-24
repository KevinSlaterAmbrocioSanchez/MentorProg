// src/controllers/intentosController.js
import db from "../config/firebase.js";

/**
 * POST /materias/:materiaId/temas/:temaId/subtemas/:subtemaId/intentos
 * Body:
 * {
 *   quizId,
 *   userId,
 *   userNombre,
 *   userEmail,
 *   aciertos,
 *   totalPreguntas
 * }
 *
 * Registra un intento de quiz y evita que el mismo usuario
 * vuelva a hacer el mismo quiz.
 */
export const registrarIntento = async (req, res) => {
  try {
    const { materiaId, temaId, subtemaId } = req.params;
    const {
      quizId,
      userId,
      userNombre,
      userEmail,
      aciertos,
      totalPreguntas,
    } = req.body;

    if (!materiaId || !temaId || !subtemaId || !quizId || !userId) {
      return res.status(400).json({
        mensaje:
          "materiaId, temaId, subtemaId, quizId y userId son obligatorios",
      });
    }

    const aciertosNum = Number(aciertos) || 0;
    const totalNum = Number(totalPreguntas) || 0;
    const porcentaje =
      totalNum > 0 ? Math.round((aciertosNum / totalNum) * 100) : 0;

    // 🛑 Revisar si el usuario YA hizo este quiz
    // Solo usamos where("userId") para no pedir índice compuesto
    const yaIntentoSnap = await db
      .collection("intentosQuiz")
      .where("userId", "==", userId)
      .get();

    let yaExisteParaEsteQuiz = false;
    yaIntentoSnap.forEach((doc) => {
      const d = doc.data();
      if (d.quizId === quizId) {
        yaExisteParaEsteQuiz = true;
      }
    });

    if (yaExisteParaEsteQuiz) {
      return res.status(409).json({
        mensaje: "Ya existe un intento para este quiz por este usuario",
      });
    }

    // ✅ Guardar intento
    const nuevoIntento = {
      materiaId,
      temaId,
      subtemaId,
      quizId,
      userId,
      userNombre: userNombre || "",
      userEmail: userEmail || "",
      aciertos: aciertosNum,
      totalPreguntas: totalNum,
      porcentaje,
      fecha: new Date().toISOString(),
    };

    const docRef = await db.collection("intentosQuiz").add(nuevoIntento);

    return res.status(201).json({
      mensaje: "Intento registrado correctamente",
      id: docRef.id,
      intento: nuevoIntento,
    });
  } catch (error) {
    console.error("❌ Error en registrarIntento:", error);
    return res.status(500).json({
      mensaje: "Error al registrar intento",
      error: error.message || String(error),
    });
  }
};

/**
 * GET /materias/:materiaId/temas/:temaId/intentos
 * (Opcional) ?subtemaId=XYZ
 *
 * Lista todos los intentos del tema (y subtema, si se envía).
 */
export const listarIntentosDeTema = async (req, res) => {
  try {
    const { materiaId, temaId } = req.params;
    const { subtemaId } = req.query || {};

    if (!materiaId || !temaId) {
      return res
        .status(400)
        .json({ mensaje: "materiaId y temaId son obligatorios" });
    }

    console.log("📊 Listando intentos para:", {
      materiaId,
      temaId,
      subtemaId: subtemaId || null,
    });

    // 🔹 Solo UN where → NO pide índice compuesto
    const snapshot = await db
      .collection("intentosQuiz")
      .where("materiaId", "==", materiaId)
      .get();

    const intentos = [];

    snapshot.forEach((doc) => {
      const d = doc.data();

      // Filtramos por temaId y subtemaId en memoria
      if (d.temaId !== temaId) return;
      if (subtemaId && d.subtemaId !== subtemaId) return;

      intentos.push({
        id: doc.id,
        userId: d.userId || null,
        userNombre: d.userNombre || null,
        userEmail: d.userEmail || null,
        subtemaId: d.subtemaId || null,
        subtemaTitulo: d.subtemaTitulo || null, // 👈 NUEVO
        quizId: d.quizId || null,
        aciertos: d.aciertos ?? 0,
        totalPreguntas: d.totalPreguntas ?? 0,
        calificacion: d.porcentaje ?? 0,
        creadoEn: d.fecha || null,
      });
    });

    // Ordenar por fecha descendente
    intentos.sort((a, b) =>
      (b.creadoEn || "").localeCompare(a.creadoEn || "")
    );

    console.log(`✅ Intentos encontrados: ${intentos.length}`);

    return res.json({
      total: intentos.length,
      intentos,
    });
  } catch (error) {
    console.error("❌ Error en listarIntentosDeTema:", error);
    return res.status(500).json({
      mensaje: "Error al listar intentos",
      error: error.message || String(error),
    });
  }
};
