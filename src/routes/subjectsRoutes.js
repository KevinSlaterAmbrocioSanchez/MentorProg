// src/routes/subjectsRoutes.js
import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";

import {
  listarSubjects,
  crearSubject,
  listarTemasDeSubject,
  crearTemaEnSubject,
  actualizarTemaEnSubject,
  eliminarTemaEnSubject,
  registrarIntentoQuiz,
  listarIntentosQuiz,
} from "../controllers/subjectsController.js";

const router = express.Router();

// Todas requieren estar logueado
router.use(verificarToken);

// =======================
// Materias / Subjects
// =======================
router.get("/", requireRoles("admin"), listarSubjects);
router.post("/", requireRoles("admin"), crearSubject);

// =======================
// Temas de una materia
// =======================
// GET /subjects/:subjectId/temas
router.get("/:subjectId/temas", requireRoles("admin"), listarTemasDeSubject);

// POST /subjects/:subjectId/temas
router.post("/:subjectId/temas", requireRoles("admin"), crearTemaEnSubject);

// PUT /subjects/:subjectId/temas/:temaId
router.put(
  "/:subjectId/temas/:temaId",
  requireRoles("admin"),
  actualizarTemaEnSubject
);

// DELETE /subjects/:subjectId/temas/:temaId
router.delete(
  "/:subjectId/temas/:temaId",
  requireRoles("admin"),
  eliminarTemaEnSubject
);

/* ============================================================
 *  QUZZES: intentos y resultados
 * ============================================================*/

// 🔹 Endpoint para que el ALUMNO envíe sus respuestas
// Ajusta los roles según cómo se llamen en tu sistema ("student", "usuario", "alumno", etc.)
router.post(
  "/:subjectId/temas/:temaId/intentos",
  requireRoles("admin", "student", "usuario", "alumno"),
  registrarIntentoQuiz
);

// 🔹 Endpoint para que el ADMIN vea los resultados del quiz
router.get(
  "/:subjectId/temas/:temaId/intentos",
  requireRoles("admin"),
  listarIntentosQuiz
);

export default router;
