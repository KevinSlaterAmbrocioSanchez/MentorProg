// src/routes/materiasRoutes.js
import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";
import {
  listarMaterias,
  obtenerMateriaPorId,
  crearMateria,
  actualizarMateria,
  eliminarMateria,
  listarTemasDeMateria,
  crearTemaEnMateria,
  actualizarTemaEnMateria,
  eliminarTemaEnMateria,
} from "../controllers/materiasController.js";
import { listarQuizzesDeTema } from "../controllers/quizzesController.js";

const router = express.Router();

// Todas estas rutas requieren token
router.use(verificarToken);

// ===== CRUD BÁSICO DE MATERIAS =====
router.get("/", requireRoles("admin", "usuario", "alumno"), listarMaterias);

router.get(
  "/:materiaId",
  requireRoles("admin", "docente", "alumno", "usuario"),
  obtenerMateriaPorId
);
router.post("/", requireRoles("admin"), crearMateria);
router.put("/:materiaId", requireRoles("admin"), actualizarMateria);
router.delete("/:materiaId", requireRoles("admin"), eliminarMateria);

// ===== TEMAS DE UNA MATERIA =====
router.get(
  "/:materiaId/temas",
  requireRoles("admin", "docente", "alumno", "usuario"),
  listarTemasDeMateria
);

router.post("/:materiaId/temas", requireRoles("admin"), crearTemaEnMateria);

router.put(
  "/:materiaId/temas/:temaId",
  requireRoles("admin"),
  actualizarTemaEnMateria
);

router.delete(
  "/:materiaId/temas/:temaId",
  requireRoles("admin"),
  eliminarTemaEnMateria
);

// ===== QUIZZES DE UN TEMA =====
// GET /materias/:materiaId/temas/:temaId/quizzes
router.get(
  "/:materiaId/temas/:temaId/quizzes",
  requireRoles("admin", "docente", "alumno", "usuario"),
  listarQuizzesDeTema
);

export default router;
