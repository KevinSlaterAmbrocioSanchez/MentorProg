// ===============================
// 🧭 Rutas de Asignaciones y Entregas
// ===============================
import express from "express";
import {
  crearAsignacion,
  obtenerAsignaciones,
  registrarEntrega,
  obtenerEntregas,
  calificarEntrega,
} from "../controllers/asignacionesController.js";

import { verificarToken } from "../middleware/authMiddleware.js";
import { verificarRol } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ===============================
// 👨‍🏫 DOCENTES
// ===============================
router.post("/", verificarRol(["docente", "admin"]), crearAsignacion);
router.get("/", verificarRol(["docente", "admin"]), obtenerAsignaciones);
router.get("/entregas/:asignacionId", verificarRol(["docente", "admin"]), obtenerEntregas);
router.put("/calificar/:entregaId", verificarRol(["docente", "admin"]), calificarEntrega);

// ===============================
// 🧑‍🎓 ALUMNOS
// ===============================
router.post("/entregar", verificarRol(["alumno"]), registrarEntrega);

export default router;
