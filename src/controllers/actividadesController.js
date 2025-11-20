import db from "../config/firebase.js";

// Crear actividad generada por IA y asignarla a los alumnos
export const crearActividad = async (req, res) => {
  try {
    const { materiaId, descripcion, contenidoIA, fechaInicio, fechaLimite } = req.body;
    const docenteId = req.usuario.uid; // viene del token

    // Guardar la actividad en la colección "actividades"
    const actividadRef = db.collection("actividades").doc();
    await actividadRef.set({
      id: actividadRef.id,
      materiaId,
      descripcion,
      contenidoIA,
      fechaInicio,
      fechaLimite,
      creadaPor: docenteId,
      estado: "pendiente", // hasta que el docente la apruebe
      fechaCreacion: new Date().toISOString(),
    });

    // Obtener los alumnos de la materia
    const alumnosSnap = await db.collection("alumnos").where("materiaId", "==", materiaId).get();
    const alumnos = alumnosSnap.docs.map((doc) => doc.data());

    // Crear registro de actividad asignada por alumno
    for (const alumno of alumnos) {
      const tareaRef = db.collection("tareas").doc();
      await tareaRef.set({
        id: tareaRef.id,
        alumnoId: alumno.id,
        actividadId: actividadRef.id,
        estado: "pendiente",
        calificacion: null,
        entregado: false,
      });
    }

    res.status(200).json({
      mensaje: "✅ Actividad creada y asignada exitosamente",
      actividadId: actividadRef.id,
    });
  } catch (error) {
    console.error("Error al crear actividad:", error);
    res.status(500).json({ error: error.message });
  }
};
