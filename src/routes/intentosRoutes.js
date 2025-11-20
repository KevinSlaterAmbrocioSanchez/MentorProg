// src/routes/intentosRoutes.js
import { Router } from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import {
  registrarIntento,
  listarIntentosDeTema,
} from "../controllers/intentosController.js";

const router = Router();

// Todas estas rutas requieren usuario logueado
router.use(verificarToken);

// Alumno registra su intento de quiz
// POST /materias/:materiaId/temas/:temaId/subtemas/:subtemaId/intentos
router.post(
  "/materias/:materiaId/temas/:temaId/subtemas/:subtemaId/intentos",
  registrarIntento
);

// Admin/Docente consulta resultados
// GET /materias/:materiaId/temas/:temaId/intentos?subtemaId=...
router.get("/materias/:materiaId/temas/:temaId/intentos", listarIntentosDeTema);

export default router;
