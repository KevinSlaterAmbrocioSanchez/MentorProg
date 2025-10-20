// ===============================
// 🛡️ RUTAS PROTEGIDAS DEL SISTEMA
// ===============================
import express from "express";
import db from "../config/firebase.js";
import { verificarToken } from "../middleware/authMiddleware.js";
import { verificarRol } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Colecciones base
const usuariosRef = db.collection("usuarios");
const materiasRef = db.collection("materias");

// ===============================
// 🔒 Middleware general de autenticación
// ===============================
router.use(verificarToken);

// ===============================
// 👑 Ruta visible solo para ADMIN
// ===============================
router.get("/admin", verificarRol(["admin"]), (req, res) => {
  res.json({
    mensaje: `Bienvenido ADMIN: ${req.usuario.email}`,
  });
});

// ===============================
// 👨‍🏫 Ruta visible para ADMIN y DOCENTE
// ===============================
router.get("/docente", verificarRol(["admin", "docente"]), (req, res) => {
  res.json({
    mensaje: `Acceso docente/autorizado: ${req.usuario.email}`,
  });
});

// ===============================
// 📊 Dashboard general (adaptado por rol)
// ===============================
router.get("/dashboard", async (req, res) => {
  try {
    const usuario = req.usuario; // tomado del token
     console.log("📥 Petición recibida en /dashboard de:", req.usuario);
    // ===== ADMIN =====
    if (usuario.rol === "admin") {
      const usuariosSnap = await usuariosRef.get();
      const materiasSnap = await materiasRef.get();

      const usuarios = usuariosSnap.docs.map((doc) => doc.data());
      const materias = materiasSnap.docs.map((doc) => doc.data());

      const conteoRoles = usuarios.reduce(
        (acc, u) => {
          acc[u.rol] = (acc[u.rol] || 0) + 1;
          return acc;
        },
        { admin: 0, docente: 0, alumno: 0 }
      );
        console.log("📤 Respuesta enviada para ADMIN");
      return res.json({
        totalUsuarios: usuarios.length,
        totalMaterias: materias.length,
        conteoRoles,
        ultimaActualizacion: new Date().toISOString(),
      });
    }

    // ===== DOCENTE =====
    if (usuario.rol === "docente") {
      const snapshot = await materiasRef
        .where("docenteEmail", "==", usuario.email)
        .get();

      const materias = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
       console.log("📤 Respuesta enviada para DOCENTE");
      return res.json({
        totalMaterias: materias.length,
        materias,
        ultimaActualizacion: new Date().toISOString(),
      });
    }

    // ===== ALUMNO =====
    if (usuario.rol === "alumno") {
      // Ejemplo de respuesta simulada (después conectaremos Firestore real)
      const progreso = [
        { materia: "Matemáticas", avance: 80 },
        { materia: "Programación", avance: 60 },
        { materia: "Bases de Datos", avance: 40 },
      ];
       console.log("📤 Respuesta enviada para ALUMNO");
      return res.json({
        totalMaterias: progreso.length,
        progreso,
        retroalimentacion: "Sigue mejorando tu promedio, vas bien 🚀",
        ultimaActualizacion: new Date().toISOString(),
      });
    }

    res.status(403).json({ mensaje: "Rol no autorizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ===============================
// 📘 Materias de un docente (admin o docente)
// ===============================
router.get("/materias/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Validar permiso: admin o el propio docente
    if (req.usuario.rol !== "admin" && req.usuario.email !== email) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const snapshot = await materiasRef.where("docenteEmail", "==", email).get();
    if (snapshot.empty)
      return res.status(404).json({ mensaje: "No hay materias asignadas" });

    const materias = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ total: materias.length, materias });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// 🔐 Verificar perfil autenticado (cualquier usuario)
// ===============================
router.get("/perfil", (req, res) => {
  res.json({
    mensaje: `Hola ${req.usuario.email}, tu token es válido.`,
    rol: req.usuario.rol,
    fechaVerificacion: new Date().toISOString(),
  });
});

// ===============================
// 🚫 Ruta no encontrada (opcional)
// ===============================
router.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta protegida no encontrada" });
});

export default router;
