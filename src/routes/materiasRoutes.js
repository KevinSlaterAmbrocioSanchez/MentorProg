import express from "express";
import {
  listarMaterias,
  listarMisMaterias,
  crearMateria,
  actualizarMateria,
  eliminarMateria,
} from "../controllers/materiasController.js";
import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas requieren autenticación
router.use(verificarToken);

// Listar (cualquiera autenticado)
router.get("/", listarMaterias);

// Crear (solo docentes o admin)
router.post("/", verificarRol(["docente", "admin"]), crearMateria);

// Ver solo las del docente logueado
router.get("/mias", verificarRol(["docente", "admin"]), listarMisMaterias);

// Actualizar / eliminar (docente dueño o admin)
router.put("/:id", verificarRol(["docente", "admin"]), actualizarMateria);
router.delete("/:id", verificarRol(["docente", "admin"]), eliminarMateria);

export default router;
