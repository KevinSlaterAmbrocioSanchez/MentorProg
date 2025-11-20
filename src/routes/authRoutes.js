// src/routes/authRoutes.js
import express from "express";
import {
  registrarUsuario,
  loginUsuario,
} from "../controllers/authController.js";
import {
  verificarToken,
  verificarRol,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Registrar usuario genérico (si lo sigues usando)
router.post("/register", registrarUsuario);

// Login
router.post("/login", loginUsuario);

// Ruta protegida de prueba
router.get("/perfil", verificarToken, (req, res) => {
  res.json({
    mensaje: "Perfil del usuario autenticado",
    usuario: req.usuario,
  });
});

// Ejemplo de ruta solo para admin con el viejo verificarRol
router.get("/admin", verificarToken, verificarRol("admin"), (req, res) => {
  res.json({
    mensaje: "Solo admins pueden ver esto",
  });
});

export default router;
