// src/controllers/quizzesController.js
import db from "../config/firebase.js";

const quizzesRef = db.collection("quizzes");
const subjectsRef = db.collection("subjects");

/**
 * POST /quizzes/gemini
 * (Por ahora sigue siendo stub; luego aquí conectamos Gemini)
 */
export const generarQuizConGemini = async (req, res) => {
  try {
    return res.status(200).json({
      mensaje: "✅ Endpoint generarQuizConGemini listo (lógica pendiente)",
      demo: true,
    });
  } catch (error) {
    console.error("❌ Error en generarQuizConGemini:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /materias/:materiaId/temas/:temaId/quizzes
 * Lista los quizzes asociados a una materia + tema
 * (Opcionalmente filtra por subtemaTitulo ?subtemaTitulo=XYZ)
 *
 * Lee directamente de subjects/{materiaId}/temas/{temaId}
 * y construye los quizzes a partir de los subtemas que tienen preguntas.
 */
export const listarQuizzesDeTema = async (req, res) => {
  try {
    const { materiaId, temaId } = req.params;
    const { subtemaTitulo } = req.query || {}; // opcional

    if (!materiaId || !temaId) {
      return res
        .status(400)
        .json({ mensaje: "materiaId y temaId son obligatorios" });
    }

    // 1. Verificar materia
    const materiaRef = subjectsRef.doc(materiaId);
    const materiaSnap = await materiaRef.get();

    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    // 2. Verificar tema
    const temaRef = materiaRef.collection("temas").doc(temaId);
    const temaSnap = await temaRef.get();

    if (!temaSnap.exists) {
      return res.status(404).json({ mensaje: "Tema no encontrado" });
    }

    const temaData = temaSnap.data();
    const subtemas = Array.isArray(temaData.subtemas)
      ? temaData.subtemas
      : [];

    // 3. Filtrar subtemas que tienen quiz
    let subtemasConQuiz = subtemas.filter(
      (st) =>
        st &&
        st.mostrarQuiz !== false &&
        Array.isArray(st.preguntas) &&
        st.preguntas.length > 0
    );

    // Si viene ?subtemaTitulo=..., filtramos solo ese
    if (subtemaTitulo) {
      subtemasConQuiz = subtemasConQuiz.filter(
        (st) => (st.titulo || "") === subtemaTitulo
      );
    }

    // 4. Construir los "quizzes" que espera la app
    const quizzes = subtemasConQuiz.map((st, idx) => ({
      // id virtual basado en el índice del subtema
      id: st.id || `${temaId}_subtema_${idx}`,
      titulo: st.titulo ? `Quiz: ${st.titulo}` : "Quiz del subtema",
      materiaId,
      temaId,
      subtemaTitulo: st.titulo || null,
      preguntas: st.preguntas || [],
    }));

    return res.json({
      total: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("❌ Error en listarQuizzesDeTema:", error);
    return res.status(500).json({
      mensaje: "Error al listar quizzes",
      error: error.message,
    });
  }
};

/**
 * GET /quizzes/:quizId
 * (Solo usado si guardas quizzes en la colección "quizzes")
 */
export const obtenerQuizPorId = async (req, res) => {
  try {
    const { quizId } = req.params;

    const docRef = quizzesRef.doc(quizId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ mensaje: "Quiz no encontrado" });
    }

    return res.json({
      id: docSnap.id,
      ...docSnap.data(),
    });
  } catch (error) {
    console.error("❌ Error en obtenerQuizPorId:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al obtener quiz", error: error.message });
  }
};

/**
 * POST /quizzes/:quizId/submit
 *
 * Opción 1:
 * - El frontend manda { materiaId, temaId, subtemaTitulo }
 * - Calificamos usando subjects/{materiaId}/temas/{temaId}/subtemas
 * - Guardamos el intento en la colección global "intentosQuiz"
 * - Si el usuario ya hizo ese quiz → 409 y NO lo dejamos repetir
 */
export const enviarRespuestasQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { respuestas, materiaId, temaId, subtemaTitulo } = req.body || {};
    const usuario = req.usuario || {};

    if (!respuestas || typeof respuestas !== "object") {
      return res
        .status(400)
        .json({ mensaje: "respuestas es obligatorio y debe ser objeto" });
    }

    if (!materiaId || !temaId) {
      return res.status(400).json({
        mensaje: "materiaId y temaId son obligatorios para calificar el quiz",
      });
    }

    // 👇 userId robusto: intenta id, uid o email
    const userId = usuario.id || usuario.uid || usuario.email || null;
    const userNombre = usuario.nombre || usuario.name || "";
    const userEmail = usuario.email || "";

    if (!userId) {
      return res.status(401).json({
        mensaje: "No se pudo identificar al usuario en el token",
      });
    }

    // 🛑 0. Verificar si YA existe un intento de este usuario para este quiz
    const yaIntentoSnap = await db
      .collection("intentosQuiz")
      .where("userId", "==", userId)
      .get();

    let yaExisteParaEsteQuiz = false;
    let intentoPrevio = null;

    yaIntentoSnap.forEach((doc) => {
      const d = doc.data();
      if (d.quizId === quizId) {
        yaExisteParaEsteQuiz = true;
        intentoPrevio = { id: doc.id, ...d };
      }
    });

    if (yaExisteParaEsteQuiz) {
      return res.status(409).json({
        mensaje: "Ya has realizado este quiz. Solo se permite un intento.",
        intentoPrevio,
      });
    }

    // 1. Materia
    const materiaRef = subjectsRef.doc(materiaId);
    const materiaSnap = await materiaRef.get();
    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    // 2. Tema
    const temaRef = materiaRef.collection("temas").doc(temaId);
    const temaSnap = await temaRef.get();
    if (!temaSnap.exists) {
      return res.status(404).json({ mensaje: "Tema no encontrado" });
    }

    const temaData = temaSnap.data();
    const subtemas = Array.isArray(temaData.subtemas)
      ? temaData.subtemas
      : [];

    // ---- DEBUG para ver qué está pasando ----
    console.log("=== Calificando quiz ===");
    console.log("quizId:", quizId);
    console.log("materiaId:", materiaId);
    console.log("temaId:", temaId);
    console.log("subtemaTitulo (body):", subtemaTitulo);
    console.log(
      "Subtemas en tema:",
      subtemas.map((st, i) => ({
        idx: i,
        id: st.id || null,
        titulo: st.titulo || null,
      }))
    );

    // 3. Localizar el subtema al que corresponde este quiz
    let subtema = null;

    // 3.1. Si el id tiene forma temaId_subtema_X, usamos el índice
    const partes = quizId.split("_subtema_");
    if (partes.length === 2) {
      const indice = parseInt(partes[1], 10);
      if (!Number.isNaN(indice) && indice >= 0 && indice < subtemas.length) {
        subtema = subtemas[indice];
        console.log("Subtema encontrado por índice:", indice);
      }
    }

    // 3.2. Por id exacto del subtema
    if (!subtema) {
      subtema = subtemas.find((st) => st.id && st.id === quizId);
      if (subtema) console.log("Subtema encontrado por id de subtema");
    }

    // 3.3. Por título
    if (!subtema && subtemaTitulo) {
      subtema = subtemas.find(
        (st) => st.titulo && st.titulo === subtemaTitulo
      );
      if (subtema) console.log("Subtema encontrado por título");
    }

    if (!subtema) {
      return res.status(404).json({
        mensaje: "No se encontró el subtema para este quiz",
      });
    }

    const preguntas = Array.isArray(subtema.preguntas)
      ? subtema.preguntas
      : [];

    // 4. Calificar
    let correctas = 0;
    const detalle = preguntas.map((p) => {
      // El frontend manda { [preguntaId]: indiceOpcionSeleccionada }
      const key =
        respuestas[p.id] !== undefined
          ? p.id
          : String(p.id) in respuestas
          ? String(p.id)
          : null;

      const respuestaUsuario = key !== null ? respuestas[key] : null;

      const opciones = Array.isArray(p.opciones) ? p.opciones : [];
      const indiceCorrecta = opciones.findIndex((op) => op.esCorrecta);

      const esCorrecta =
        respuestaUsuario !== null &&
        indiceCorrecta !== -1 &&
        respuestaUsuario === indiceCorrecta;

      if (esCorrecta) correctas += 1;

      return {
        preguntaId: p.id,
        seleccionUsuario: respuestaUsuario,
        indiceCorrecta,
        esCorrecta,
      };
    });

    const total = preguntas.length;
    const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;

    // 5. Guardar intento en la colección GLOBAL intentosQuiz
    const subtemaId = subtema.id || null;
    const subtemaTituloFinal = subtemaTitulo || subtema.titulo || null;

    const nuevoIntento = {
      materiaId,
      temaId,
      subtemaId,
      subtemaTitulo: subtemaTituloFinal,
      quizId,
      userId,
      userNombre,
      userEmail,
      aciertos: correctas,
      totalPreguntas: total,
      porcentaje,
      fecha: new Date().toISOString(),
    };

    const intentoRef = await db.collection("intentosQuiz").add(nuevoIntento);

    console.log("✅ Intento guardado en intentosQuiz con id:", intentoRef.id);

    // 6. Respuesta al cliente
    return res.json({
      mensaje: "✅ Quiz calificado correctamente",
      correctas,
      total,
      porcentaje,
      detalle,
      intentoId: intentoRef.id,
    });
  } catch (error) {
    console.error("❌ Error en enviarRespuestasQuiz:", error);
    return res.status(500).json({
      mensaje: "Error al enviar respuestas",
      error: error.message,
    });
  }
};
