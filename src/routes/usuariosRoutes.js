// src/routes/usuariosRoutes.js
import express from "express";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuariosController.js";
import {
  verificarToken,
  verificarRol,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas de usuarios requieren token y rol admin
router.use(verificarToken);
router.use(verificarRol("admin"));

// Listar usuarios
router.get("/", listarUsuarios);

// Crear usuario (alumno/docente/admin)
router.post("/", crearUsuario);

// Actualizar usuario
router.put("/:id", actualizarUsuario);

// Eliminar usuario
router.delete("/:id", eliminarUsuario);

export default router;
