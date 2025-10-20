// ===============================
// 🧭 Rutas de Usuarios
// ===============================
import express from "express";
import {
  obtenerUsuarios,
  obtenerUsuario,
  miPerfil,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerDocentes, // ✅ NUEVA FUNCIÓN
} from "../controllers/usuariosController.js";

import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// 🔐 Todas las rutas requieren autenticación
// ===============================
router.use(verificarToken);

// ===============================
// 👑 Solo admin
// ===============================
router.get("/", verificarRol(["admin"]), obtenerUsuarios);
router.get("/docentes", verificarRol(["admin"]), obtenerDocentes); // ✅ MOVER AQUÍ ARRIBA
router.post("/", verificarRol(["admin"]), crearUsuario);
router.delete("/:id", verificarRol(["admin"]), eliminarUsuario);

// ===============================
// 👤 Admin o dueño
// ===============================
router.get("/me", miPerfil);
router.get("/:id", obtenerUsuario);
router.put("/:id", actualizarUsuario);

// ===============================
// 🚫 Ruta no encontrada (opcional pero útil)
// ===============================
router.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta de usuarios no encontrada" });
});

export default router;
