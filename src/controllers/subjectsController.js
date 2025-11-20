// src/controllers/subjectsController.js
import db from "../config/firebase.js";

const subjectsRef = db.collection("subjects");
const quizAttemptsRef = db.collection("quizAttempts"); // 👈 NUEVA colección para intentos

/**
 * GET /subjects
 * Lista todas las materias (subjects)
 */
export const listarSubjects = async (req, res) => {
  try {
    const snap = await subjectsRef.get();

    const subjects = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // id REAL del documento
        ...data,
      };
    });

    return res.json({
      total: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error("❌ Error en listarSubjects:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /subjects
 * Crea una nueva materia
 * Body esperado desde el frontend:
 * {
 *   id: "BBQ-1985",
 *   nombre: "Administración de redes",
 *   carrera: "Ingeniería en Sistemas Computacionales",
 *   satca: { creditos, teoria, practica },
 *   descripcion: "texto opcional"
 * }
 */
export const crearSubject = async (req, res) => {
  try {
    const {
      id, // clave que queremos usar como ID del doc
      nombre,
      carrera = "",
      satca = {},
      descripcion = "",
      nivel = "básico",
      etiqueta = "",
      ...resto
    } = req.body;

    if (!id || !nombre) {
      return res.status(400).json({
        mensaje: "id (clave) y nombre son obligatorios",
      });
    }

    const subjectDocRef = subjectsRef.doc(id);
    const existente = await subjectDocRef.get();

    if (existente.exists) {
      return res.status(409).json({
        mensaje: `Ya existe una materia con id '${id}'. Usa otra clave.`,
      });
    }

    const satcaNormalizado = {
      creditos: Number(satca.creditos) || 0,
      teoria: Number(satca.teoria) || 0,
      practica: Number(satca.practica) || 0,
    };

    const nuevoSubject = {
      id, // también lo guardamos como campo interno
      nombre,
      carrera,
      descripcion,
      nivel,
      etiqueta,
      satca: satcaNormalizado,
      creadoPor: req.usuario?.email || "admin@mentorprog.com",
      creadoEn: new Date().toISOString(),
      ...resto,
    };

    await subjectDocRef.set(nuevoSubject);

    return res.status(201).json({
      mensaje: "✅ Materia creada correctamente",
      id,
      subject: { id, ...nuevoSubject },
    });
  } catch (error) {
    console.error("❌ Error en crearSubject:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /subjects/:subjectId/temas
 * Lista los temas de una materia (subcolección "temas")
 */
export const listarTemasDeSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ mensaje: "subjectId es requerido" });
    }

    const materiaRef = subjectsRef.doc(subjectId);
    const materiaSnap = await materiaRef.get();

    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const temasSnap = await materiaRef.collection("temas").get();

    const temas = temasSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      total: temas.length,
      temas,
    });
  } catch (error) {
    console.error("❌ Error en listarTemasDeSubject:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /subjects/:subjectId/temas
 * Crea un tema dentro de una materia
 * Body: { titulo, descripcion, subtemas? }
 */
export const crearTemaEnSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { titulo, descripcion = "", subtemas = [] } = req.body;

    if (!subjectId) {
      return res.status(400).json({ mensaje: "subjectId es requerido" });
    }
    if (!titulo) {
      return res
        .status(400)
        .json({ mensaje: "El título del tema es obligatorio" });
    }

    const materiaRef = subjectsRef.doc(subjectId);
    const materiaSnap = await materiaRef.get();

    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const tema = {
      titulo,
      descripcion,
      subtemas,
      creadoEn: new Date().toISOString(),
      creadoPor: req.usuario?.email || "admin@mentorprog.com",
    };

    const temasRef = materiaRef.collection("temas");
    const ref = await temasRef.add(tema);

    return res.status(201).json({
      mensaje: "✅ Tema creado correctamente",
      id: ref.id,
      tema: { id: ref.id, ...tema },
    });
  } catch (error) {
    console.error("❌ Error en crearTemaEnSubject:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /subjects/:subjectId/temas/:temaId
 * Actualiza un tema existente
 */
export const actualizarTemaEnSubject = async (req, res) => {
  try {
    const { subjectId, temaId } = req.params;
    const { titulo, descripcion = "", subtemas = [] } = req.body;

    if (!subjectId || !temaId) {
      return res
        .status(400)
        .json({ mensaje: "subjectId y temaId son requeridos" });
    }
    if (!titulo) {
      return res
        .status(400)
        .json({ mensaje: "El título del tema es obligatorio" });
    }

    const temaRef = subjectsRef.doc(subjectId).collection("temas").doc(temaId);

    const temaSnap = await temaRef.get();
    if (!temaSnap.exists) {
      return res.status(404).json({ mensaje: "Tema no encontrado" });
    }

    const datosPrevios = temaSnap.data();

    const temaActualizado = {
      ...datosPrevios,
      titulo,
      descripcion,
      subtemas,
      actualizadoEn: new Date().toISOString(),
      actualizadoPor: req.usuario?.email || "admin@mentorprog.com",
    };

    await temaRef.set(temaActualizado, { merge: false });

    return res.json({
      mensaje: "✅ Tema actualizado correctamente",
      tema: { id: temaId, ...temaActualizado },
    });
  } catch (error) {
    console.error("❌ Error en actualizarTemaEnSubject:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /subjects/:subjectId/temas/:temaId
 * Elimina un tema
 */
export const eliminarTemaEnSubject = async (req, res) => {
  try {
    const { subjectId, temaId } = req.params;

    if (!subjectId || !temaId) {
      return res
        .status(400)
        .json({ mensaje: "subjectId y temaId son requeridos" });
    }

    const temaRef = subjectsRef.doc(subjectId).collection("temas").doc(temaId);

    const temaSnap = await temaRef.get();
    if (!temaSnap.exists) {
      return res.status(404).json({ mensaje: "Tema no encontrado" });
    }

    await temaRef.delete();

    return res.json({ mensaje: "🗑️ Tema eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error en eliminarTemaEnSubject:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
 *  QUIZZES: registrar intentos y listar resultados
 * ============================================================*/

/**
 * POST /subjects/:subjectId/temas/:temaId/intentos
 * Body:
 * {
 *   subtemaId: "id-del-subtema",
 *   respuestas: [
 *     { preguntaId: "p1", opcionId: "op1" },
 *     { preguntaId: "p2", opcionId: "opX" },
 *     ...
 *   ]
 * }
 *
 * Usa la definición del tema/subtema en Firestore para calcular
 * cuántas están correctas, guarda el intento y regresa el resumen.
 */
export const registrarIntentoQuiz = async (req, res) => {
  try {
    const { subjectId, temaId } = req.params;
    const { subtemaId, respuestas = [] } = req.body;

    if (!subjectId || !temaId) {
      return res
        .status(400)
        .json({ mensaje: "subjectId y temaId son requeridos" });
    }
    if (!subtemaId) {
      return res.status(400).json({ mensaje: "subtemaId es requerido" });
    }
    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Debe enviar al menos una respuesta" });
    }

    // Datos del usuario que responde (vienen del token)
    const userId = req.usuario?.uid || req.usuario?.id || null;
    const userEmail = req.usuario?.email || "";
    const userNombre =
      req.usuario?.nombre || req.usuario?.displayName || "Sin nombre";

    // Leemos el tema para conocer las preguntas y opciones correctas
    const temaRef = subjectsRef.doc(subjectId).collection("temas").doc(temaId);
    const temaSnap = await temaRef.get();

    if (!temaSnap.exists) {
      return res.status(404).json({ mensaje: "Tema no encontrado" });
    }

    const temaData = temaSnap.data();
    const subtemas = temaData.subtemas || [];

    const subtema = subtemas.find((st) => st.id === subtemaId);
    if (!subtema) {
      return res.status(404).json({ mensaje: "Subtema no encontrado" });
    }

    const preguntas = subtema.preguntas || [];

    // Mapa: preguntaId -> opcionCorrectaId
    const mapaCorrectas = {};
    preguntas.forEach((p) => {
      if (!p || !p.id) return;
      const correcta = (p.opciones || []).find((op) => op.esCorrecta);
      if (correcta && correcta.id) {
        mapaCorrectas[p.id] = correcta.id;
      }
    });

    let totalPreguntas = 0;
    let aciertos = 0;

    const detalleRespuestas = respuestas.map((r) => {
      const preguntaId = r.preguntaId;
      const opcionElegidaId = r.opcionId;

      const opcionCorrectaId = mapaCorrectas[preguntaId] || null;
      const esCorrecta =
        opcionCorrectaId && opcionElegidaId === opcionCorrectaId;

      if (opcionCorrectaId) {
        totalPreguntas += 1;
        if (esCorrecta) aciertos += 1;
      }

      return {
        preguntaId,
        opcionElegidaId,
        opcionCorrectaId,
        esCorrecta,
      };
    });

    const calificacion =
      totalPreguntas > 0
        ? Number(((aciertos / totalPreguntas) * 100).toFixed(2))
        : 0;

    const intento = {
      userId,
      userEmail,
      userNombre,

      subjectId,
      temaId,
      subtemaId,
      temaTitulo: temaData.titulo || "",
      subtemaTitulo: subtema.titulo || "",

      totalPreguntas,
      aciertos,
      calificacion, // porcentaje 0–100

      respuestas: detalleRespuestas,
      creadoEn: new Date().toISOString(), // fecha y hora
    };

    const ref = await quizAttemptsRef.add(intento);

    return res.status(201).json({
      mensaje: "✅ Intento de quiz registrado",
      id: ref.id,
      intento: { id: ref.id, ...intento },
    });
  } catch (error) {
    console.error("❌ Error en registrarIntentoQuiz:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /subjects/:subjectId/temas/:temaId/intentos?subtemaId=...
 * Lista los intentos de quiz de un tema (y opcionalmente de un subtema)
 * para que el ADMIN pueda ver quién contestó, cuánto sacó y cuándo.
 */
export const listarIntentosQuiz = async (req, res) => {
  try {
    const { subjectId, temaId } = req.params;
    const { subtemaId } = req.query;

    if (!subjectId || !temaId) {
      return res
        .status(400)
        .json({ mensaje: "subjectId y temaId son requeridos" });
    }

    let query = quizAttemptsRef
      .where("subjectId", "==", subjectId)
      .where("temaId", "==", temaId);

    if (subtemaId) {
      query = query.where("subtemaId", "==", subtemaId);
    }

    // Ordenamos por fecha/hora descendente
    // (como guardamos string ISO, ordena cronológicamente bien)
    const snap = await query.get();

    const intentos = snap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // por si quieres ver los últimos primero
      .sort((a, b) => (b.creadoEn || "").localeCompare(a.creadoEn || ""));

    return res.json({
      total: intentos.length,
      intentos,
    });
  } catch (error) {
    console.error("❌ Error en listarIntentosQuiz:", error);
    return res.status(500).json({ error: error.message });
  }
};
