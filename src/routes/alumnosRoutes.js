import express from "express";
import { obtenerAlumnosPorMateria } from "../controllers/alumnosController.js";
import { verificarToken } from "../middleware/authMiddleware.js"; // ✅ nombre correcto

const router = express.Router();

router.get("/materia/:id", verificarToken, obtenerAlumnosPorMateria);

export default router;
