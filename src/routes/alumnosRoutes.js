// src/routes/alumnosRoutes.js
import express from "express";
import {
  crearAlumno,
  listarAlumnos,
  buscarPorNumControl,
  actualizarAlumno,
  eliminarAlumno,
  asignarAlumnoAMateria,
} from "../controllers/alumnosController.js";

import { verificarToken } from "../middleware/authMiddleware.js";
// Si manejas roles, puedes agregar verificarRol(["admin","docente"])

const router = express.Router();

router.use(verificarToken);

router.get("/", listarAlumnos);
router.get("/buscar", buscarPorNumControl);
router.post("/", crearAlumno);
router.put("/:uid", actualizarAlumno);
router.delete("/:uid", eliminarAlumno);

// Nota: esta ruta también la puedes exponer desde routes de materias.
// La dejo aquí para que tu frontend funcione inmediato con `${API}/${MAT}/${id}/alumnos`
router.post("/:materiaId/alumnos", asignarAlumnoAMateria);

export default router;

