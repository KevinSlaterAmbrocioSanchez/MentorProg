// src/controllers/materiasController.js
import db from "../config/firebase.js";

const subjectsRef = db.collection("subjects");

// =====================================================
// 🔹 MATERIAS (realmente usamos la colección "subjects")
// =====================================================

// GET /materias
export const listarMaterias = async (req, res) => {
  try {
    const snapshot = await subjectsRef.get();
    const materias = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || "",
        carrera: data.carrera || "",
        descripcion: data.descripcion || "",
        satca: data.satca || null,
        creadoEn: data.creadoEn || null,
      };
    });

    return res.json(materias);
  } catch (error) {
    console.error("❌ Error en listarMaterias:", error);
    return res.status(500).json({ mensaje: "Error al listar materias" });
  }
};

// GET /materias/:materiaId
export const obtenerMateriaPorId = async (req, res) => {
  try {
    const { materiaId } = req.params;

    const docRef = subjectsRef.doc(materiaId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const data = docSnap.data();

    return res.json({
      id: docSnap.id,
      nombre: data.nombre || "",
      carrera: data.carrera || "",
      descripcion: data.descripcion || "",
      satca: data.satca || null,
      creadoEn: data.creadoEn || null,
    });
  } catch (error) {
    console.error("❌ Error en obtenerMateriaPorId:", error);
    return res.status(500).json({ mensaje: "Error al obtener la materia" });
  }
};

// POST /materias
export const crearMateria = async (req, res) => {
  try {
    const {
      id, // opcional
      nombre,
      carrera,
      descripcion,
      satca,
    } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ mensaje: "El nombre de la materia es obligatorio" });
    }

    let docRef;
    const payload = {
      nombre,
      carrera: carrera || "",
      descripcion: descripcion || "",
      satca: satca || null,
      creadoEn: new Date().toISOString(),
    };

    if (id) {
      docRef = subjectsRef.doc(id);
      await docRef.set(payload);
    } else {
      docRef = await subjectsRef.add(payload);
    }

    return res.status(201).json({
      mensaje: "✅ Materia creada correctamente",
      id: docRef.id,
    });
  } catch (error) {
    console.error("❌ Error en crearMateria:", error);
    return res.status(500).json({ mensaje: "Error al crear la materia" });
  }
};

// PUT /materias/:materiaId
export const actualizarMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const { nombre, carrera, descripcion, satca } = req.body;

    const docRef = subjectsRef.doc(materiaId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (carrera) updates.carrera = carrera;
    if (descripcion) updates.descripcion = descripcion;
    if (satca) updates.satca = satca;

    await docRef.update(updates);

    return res.json({ mensaje: "✅ Materia actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error en actualizarMateria:", error);
    return res.status(500).json({ mensaje: "Error al actualizar materia" });
  }
};

// DELETE /materias/:materiaId
export const eliminarMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;

    const docRef = subjectsRef.doc(materiaId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    // Opcional: aquí podrías también borrar subcolecciones "temas"
    await docRef.delete();

    return res.json({ mensaje: "✅ Materia eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error en eliminarMateria:", error);
    return res.status(500).json({ mensaje: "Error al eliminar materia" });
  }
};

// =====================================================
// 🔹 TEMAS de una materia (subcolección "temas")
//     Ruta base: /materias/:materiaId/temas
// =====================================================

// GET /materias/:materiaId/temas
export const listarTemasDeMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;

    const materiaRef = subjectsRef.doc(materiaId);
    const materiaSnap = await materiaRef.get();

    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const temasSnap = await materiaRef
      .collection("temas")
      .orderBy("orden", "asc")
      .get();

    const temas = temasSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        orden: data.orden || 0,
        subtemas: data.subtemas || [],
        creadoEn: data.creadoEn || null,
      };
    });

    return res.json({ materiaId, temas });
  } catch (error) {
    console.error("❌ Error en listarTemasDeMateria:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al listar temas de la materia" });
  }
};

// POST /materias/:materiaId/temas
export const crearTemaEnMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const { titulo, descripcion, subtemas } = req.body;

    if (!titulo) {
      return res
        .status(400)
        .json({ mensaje: "El título del tema es obligatorio" });
    }

    const materiaRef = subjectsRef.doc(materiaId);
    const materiaSnap = await materiaRef.get();

    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const temasRef = materiaRef.collection("temas");
    const nuevoTema = {
      titulo,
      descripcion: descripcion || "",
      orden: Date.now(), // sencillo para ordenar por creación
      subtemas: Array.isArray(subtemas) ? subtemas : [],
      creadoEn: new Date().toISOString(),
    };

    const docRef = await temasRef.add(nuevoTema);

    return res.status(201).json({
      mensaje: "✅ Tema creado correctamente",
      tema: { id: docRef.id, ...nuevoTema },
    });
  } catch (error) {
    console.error("❌ Error en crearTemaEnMateria:", error);
    return res.status(500).json({ mensaje: "Error al crear tema" });
  }
};

// PUT /materias/:materiaId/temas/:temaId
export const actualizarTemaEnMateria = async (req, res) => {
  try {
    const { materiaId, temaId } = req.params;
    const { titulo, descripcion, orden, subtemas } = req.body;

    const materiaRef = subjectsRef.doc(materiaId);
    const materiaSnap = await materiaRef.get();

    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const temaRef = materiaRef.collection("temas").doc(temaId);
    const temaSnap = await temaRef.get();

    if (!temaSnap.exists) {
      return res.status(404).json({ mensaje: "Tema no encontrado" });
    }

    const updates = {};
    if (titulo) updates.titulo = titulo;
    if (descripcion) updates.descripcion = descripcion;
    if (typeof orden === "number") updates.orden = orden;
    if (Array.isArray(subtemas)) updates.subtemas = subtemas;

    await temaRef.update(updates);

    return res.json({ mensaje: "✅ Tema actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error en actualizarTemaEnMateria:", error);
    return res.status(500).json({ mensaje: "Error al actualizar tema" });
  }
};

// DELETE /materias/:materiaId/temas/:temaId
export const eliminarTemaEnMateria = async (req, res) => {
  try {
    const { materiaId, temaId } = req.params;

    const materiaRef = subjectsRef.doc(materiaId);
    const materiaSnap = await materiaRef.get();

    if (!materiaSnap.exists) {
      return res.status(404).json({ mensaje: "Materia no encontrada" });
    }

    const temaRef = materiaRef.collection("temas").doc(temaId);
    const temaSnap = await temaRef.get();

    if (!temaSnap.exists) {
      return res.status(404).json({ mensaje: "Tema no encontrado" });
    }

    await temaRef.delete();

    return res.json({ mensaje: "✅ Tema eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error en eliminarTemaEnMateria:", error);
    return res.status(500).json({ mensaje: "Error al eliminar tema" });
  }
};
