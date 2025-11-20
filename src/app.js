// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/firebase.js";

// Rutas
import authRoutes from "./routes/authRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import materiasRoutes from "./routes/materiasRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import asignacionesRoutes from "./routes/asignacionesRoutes.js";
import alumnosRoutes from "./routes/alumnosRoutes.js";
import iaRoutes from "./routes/iaRoutes.js";
import actividadesRoutes from "./routes/actividadesRoutes.js";
import subjectsRoutes from "./routes/subjectsRoutes.js";
import quizzesRoutes from "./routes/quizzesRoutes.js";
import progresoRoutes from "./routes/progresoRoutes.js";
import intentosRoutes from "./routes/intentosRoutes.js"; // 👈 NUEVO

dotenv.config();

const app = express();

// ================== MIDDLEWARES GLOBALES ==================
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ================== RUTAS BÁSICAS ==================
app.get("/", (req, res) => {
  res.send("MentorProg API funcionando correctamente");
});

app.get("/prueba", async (req, res) => {
  try {
    const ref = db.collection("usuarios").doc("usuario1");
    await ref.set({
      nombre: "Kevin Slater",
      rol: "usuario",
      fecha_creacion: new Date().toISOString(),
    });

    res.json({
      mensaje: "Conexión exitosa con Firestore y documento creado",
    });
  } catch (error) {
    console.error("Error en /prueba:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================== RUTAS SIN /api ==================
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/materias", materiasRoutes);
app.use("/asignaciones", asignacionesRoutes);
app.use("/alumnos", alumnosRoutes);
app.use("/actividades", actividadesRoutes);
app.use("/subjects", subjectsRoutes);
app.use("/ia", iaRoutes);
app.use("/quizzes", quizzesRoutes);
app.use("/progreso", progresoRoutes); // progreso sin /api
app.use(intentosRoutes);               // 👈 aquí viven /materias/:id/temas/:id/intentos

// ================== RUTAS CON /api ==================
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/materias", materiasRoutes);
app.use("/api/asignaciones", asignacionesRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/actividades", actividadesRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/quizzes", quizzesRoutes);
app.use("/api/progreso", progresoRoutes);
// (Opcional) versión /api de intentos:
app.use("/api", intentosRoutes);       // → /api/materias/:id/temas/:id/intentos

// ================== 404 (DEBE IR AL FINAL) ==================
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada. Verifica la URL o el método HTTP.",
  });
});

// ================== MANEJO DE ERRORES ==================
app.use((err, req, res, next) => {
  console.error("Error interno:", err.stack);
  res.status(500).json({
    mensaje: "Error interno del servidor",
    detalle: err.message,
  });
});

export default app;
