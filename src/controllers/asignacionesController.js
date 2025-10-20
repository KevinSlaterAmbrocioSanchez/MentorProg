// ===============================
// 📘 Controlador de Asignaciones y Entregas
// ===============================
import db from "../config/firebase.js";

const asignacionesRef = db.collection("asignaciones");
const entregasRef = db.collection("entregas");

// ===============================
// 🔹 Crear una nueva asignación (solo docente)
// ===============================
export const crearAsignacion = async (req, res) => {
  try {
    const { materiaId, titulo, descripcion, fechaEntrega } = req.body;

    if (!materiaId || !titulo || !descripcion) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    const nuevaAsignacion = {
      materiaId,
      titulo,
      descripcion,
      fechaEntrega: fechaEntrega || "No definida",
      docenteEmail: req.usuario.email,
      creadaEn: new Date().toISOString(),
    };

    const ref = await asignacionesRef.add(nuevaAsignacion);
    res.status(201).json({
      mensaje: "✅ Asignación creada correctamente",
      id: ref.id,
      asignacion: nuevaAsignacion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Obtener asignaciones (según rol)
// ===============================
export const obtenerAsignaciones = async (req, res) => {
  try {
    let snapshot;

    if (req.usuario.rol === "admin") {
      snapshot = await asignacionesRef.get();
    } else if (req.usuario.rol === "docente") {
      snapshot = await asignacionesRef.where("docenteEmail", "==", req.usuario.email).get();
    } else {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const asignaciones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ total: asignaciones.length, asignaciones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Registrar entrega de un alumno
// ===============================
export const registrarEntrega = async (req, res) => {
  try {
    const { asignacionId, linkEvidencia, comentario } = req.body;

    if (!asignacionId || !linkEvidencia) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    const nuevaEntrega = {
      asignacionId,
      alumnoEmail: req.usuario.email,
      linkEvidencia,
      comentario: comentario || "",
      entregadaEn: new Date().toISOString(),
    };

    const ref = await entregasRef.add(nuevaEntrega);

    res.status(201).json({
      mensaje: "📤 Entrega registrada correctamente",
      id: ref.id,
      entrega: nuevaEntrega,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Consultar entregas de una asignación (docente o admin)
// ===============================
export const obtenerEntregas = async (req, res) => {
  try {
    const { asignacionId } = req.params;

    const snapshot = await entregasRef.where("asignacionId", "==", asignacionId).get();
    if (snapshot.empty)
      return res.status(404).json({ mensaje: "No hay entregas para esta asignación" });

    const entregas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ total: entregas.length, entregas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Calificar entrega (solo docente o admin)
// ===============================
export const calificarEntrega = async (req, res) => {
  try {
    const { entregaId } = req.params;
    const { calificacion, retroalimentacion } = req.body;

    if (!calificacion) {
      return res.status(400).json({ mensaje: "Debe ingresar una calificación" });
    }

    const entregaRef = entregasRef.doc(entregaId);
    const doc = await entregaRef.get();
    if (!doc.exists)
      return res.status(404).json({ mensaje: "Entrega no encontrada" });

    await entregaRef.update({
      calificacion,
      retroalimentacion: retroalimentacion || "",
      calificadaEn: new Date().toISOString(),
    });

    res.json({ mensaje: "✅ Entrega calificada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
