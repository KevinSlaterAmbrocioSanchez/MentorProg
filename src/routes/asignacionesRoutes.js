import express from "express";
import {
  crearAsignacion,
  obtenerAsignaciones,
  registrarEntrega,
  obtenerEntregas,
  calificarEntrega,
} from "../controllers/asignacionesController.js";

import { asignarAlumnoAClase } from "../controllers/alumnosController.js";
import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verificarToken);

// 👑 Admin crea / ve / califica asignaciones
router.post("/", verificarRol(["admin"]), crearAsignacion);
router.get("/", verificarRol(["admin"]), obtenerAsignaciones);
router.get("/entregas/:asignacionId", verificarRol(["admin"]), obtenerEntregas);
router.put("/calificar/:entregaId", verificarRol(["admin"]), calificarEntrega);

// Esta parte de clases-alumnos la podemos dejar para después
router.post("/:claseId/alumnos", verificarRol(["admin"]), asignarAlumnoAClase);

// 👤 Usuario entrega sus evidencias
router.post("/entregar", verificarRol(["usuario"]), registrarEntrega);

export default router;
