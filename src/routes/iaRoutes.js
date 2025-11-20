// src/routes/iaRoutes.js
import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import { requireAdminRole } from "../middleware/roleMiddleware.js";
import { generarContenidoTema } from "../controllers/iaController.js";

const router = express.Router();

// Solo admin puede pedir a Gemini que genere contenido de un tema
router.post(
  "/tema/contenido",
  verificarToken,
  requireAdminRole,
  generarContenidoTema
);

export default router;
