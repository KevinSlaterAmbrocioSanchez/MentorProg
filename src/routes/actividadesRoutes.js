import express from "express";
import { crearActividad } from "../controllers/actividadesController.js";
import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

// Solo docentes pueden crear actividades
router.post("/", verificarToken, verificarRol("docente"), crearActividad);

export default router;
