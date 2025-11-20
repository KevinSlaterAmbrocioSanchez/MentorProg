// src/routes/progresoRoutes.js
import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import { obtenerProgresoUsuario } from "../controllers/progresoController.js";

const router = express.Router();

// Todas las rutas de progreso requieren sesión
router.use(verificarToken);

// GET /progreso  -> progreso del usuario autenticado
router.get("/", obtenerProgresoUsuario);

export default router;
