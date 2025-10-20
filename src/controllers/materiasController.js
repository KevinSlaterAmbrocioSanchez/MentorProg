// ===============================
// 🎓 Controlador de Materias (Firebase)
// ===============================
import db from "../config/firebase.js";

const materiasRef = db.collection("materias");

// ===============================
// 🔹 Obtener todas las materias
// ===============================
export const listarMaterias = async (req, res) => {
  try {
    let snap;

    // Si el usuario es docente → solo sus materias
    if (req.usuario.rol === "docente") {
      snap = await materiasRef
        .where("docenteEmail", "==", req.usuario.email)
        .get();
    } else {
      // Admin ve todas las materias
      snap = await materiasRef.get();
    }

    const materias = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      total: materias.length,
      materias,
    });
  } catch (error) {
    console.error("❌ Error al listar materias:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Obtener materias del docente logueado
// ===============================
export const listarMisMaterias = async (req, res) => {
  try {
    const snap = await materiasRef
      .where("docenteEmail", "==", req.usuario.email)
      .get();

    const materias = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      total: materias.length,
      materias,
    });
  } catch (error) {
    console.error("❌ Error al listar mis materias:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Crear nueva materia (Admin o Docente)
// ===============================
export const crearMateria = async (req, res) => {
  try {
    const {
      nombre,
      codigo = "",
      cupo = 30,
      descripcion = "",
      docenteEmail,
      docenteNombre,
    } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ mensaje: "⚠️ El nombre de la materia es obligatorio." });
    }

    // Determinar a quién se asigna la materia
    let correoAsignado, nombreDocenteAsignado;

    if (req.usuario.rol === "admin") {
      correoAsignado = docenteEmail || req.usuario.email;
      nombreDocenteAsignado = docenteNombre || req.usuario.nombre || "Docente no especificado";
    } else {
      correoAsignado = req.usuario.email;
      nombreDocenteAsignado = req.usuario.nombre || "Docente no especificado";
    }

    const nuevaMateria = {
      nombre,
      codigo,
      cupo,
      descripcion,
      docenteEmail: correoAsignado,
      docenteNombre: nombreDocenteAsignado,
      creadaPor: req.usuario.nombre || "Usuario sin nombre",
      rolCreador: req.usuario.rol,
      creadaEn: new Date().toISOString(),
    };

    const ref = await materiasRef.add(nuevaMateria);

    res.status(201).json({
      id: ref.id,
      mensaje: "✅ Materia creada correctamente",
      materia: nuevaMateria,
    });
  } catch (error) {
    console.error("❌ Error al crear materia:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Actualizar materia (Admin o Docente dueño)
// ===============================
export const actualizarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cupo, descripcion } = req.body;

    const docRef = materiasRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "⚠️ Materia no encontrada." });
    }

    const materia = doc.data();

    // Validar permisos
    if (
      req.usuario.rol !== "admin" &&
      req.usuario.email !== materia.docenteEmail
    ) {
      return res
        .status(403)
        .json({ mensaje: "🚫 No tienes permisos para editar esta materia." });
    }

    const update = {};
    if (nombre !== undefined) update.nombre = nombre;
    if (cupo !== undefined) update.cupo = cupo;
    if (descripcion !== undefined) update.descripcion = descripcion;

    update.actualizadaEn = new Date().toISOString();

    await docRef.update(update);

    res.json({ mensaje: "✅ Materia actualizada correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar materia:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🔹 Eliminar materia (Admin o Docente dueño)
// ===============================
export const eliminarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = materiasRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "⚠️ Materia no encontrada." });
    }

    const materia = doc.data();

    // Validar permisos
    if (
      req.usuario.rol !== "admin" &&
      req.usuario.email !== materia.docenteEmail
    ) {
      return res
        .status(403)
        .json({ mensaje: "🚫 No tienes permisos para eliminar esta materia." });
    }

    await docRef.delete();

    res.json({ mensaje: "🗑️ Materia eliminada correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar materia:", error);
    res.status(500).json({ error: error.message });
  }
};
