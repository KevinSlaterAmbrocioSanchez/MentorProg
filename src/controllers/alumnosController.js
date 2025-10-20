// src/controllers/alumnosController.js
import admin from "firebase-admin";
const db = admin.firestore();

export const obtenerAlumnosPorMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection("usuarios").where("materiaId", "==", id).get();

    const alumnos = snapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().nombre,
      email: doc.data().email,
    }));

    res.json({ alumnos });
  } catch (error) {
    console.error("❌ Error al obtener alumnos:", error);
    res.status(500).json({ error: "No se pudieron obtener los alumnos." });
  }
};
