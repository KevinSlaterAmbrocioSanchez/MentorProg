import express from "express";
import { crearActividad } from "../controllers/actividadesController.js";
import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verificarToken, verificarRol(["admin"]), crearActividad);
export default router;
