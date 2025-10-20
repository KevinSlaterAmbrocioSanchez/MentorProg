import express from "express";
import { registrarUsuario, loginUsuario } from "../controllers/authController.js";
import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);

// Rutas protegidas
router.get("/perfil", verificarToken, (req, res) => {
  res.json({ mensaje: `Bienvenido, ${req.usuario.email}` });
});

// Rutas con roles específicos
router.get("/admin", verificarToken, verificarRol("admin"), (req, res) => {
  res.json({ mensaje: "Acceso permitido solo a administradores 👑" });
});

router.get("/docente", verificarToken, verificarRol("docente"), (req, res) => {
  res.json({ mensaje: "Acceso permitido solo a docentes 🧑‍🏫" });
});

export default router;
