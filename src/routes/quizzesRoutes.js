// src/routes/quizzesRoutes.js
import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";
import {
  generarQuizConGemini,
  listarQuizzesDeTema, // (esta se usará desde materiasRoutes)
  obtenerQuizPorId,
  enviarRespuestasQuiz,
} from "../controllers/quizzesController.js";

const router = express.Router();

// Todas las rutas de quizzes requieren estar autenticado
router.use(verificarToken);

// 🔹 Generar quiz para un tema con Gemini (solo admin)
router.post("/gemini", requireRoles("admin"), generarQuizConGemini);

// 🔹 Obtener un quiz específico (admin, docente, alumno, usuario)
router.get(
  "/:quizId",
  requireRoles("admin", "docente", "alumno", "usuario"),
  obtenerQuizPorId
);

// 🔹 Enviar respuestas de un quiz (admin, docente, alumno, usuario)
router.post(
  "/:quizId/submit",
  requireRoles("admin", "docente", "alumno", "usuario"),
  enviarRespuestasQuiz
);

export default router;
