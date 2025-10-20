import express from "express";
import { generarActividadIA } from "../controllers/iaController.js";
import { verificarToken } from "../middleware/authMiddleware.js"; // ✅ nombre correcto

const router = express.Router();

router.post("/gemini", verificarToken, generarActividadIA);

export default router;
