// ===============================
// 🚀 MentorProg API - app.js
// ===============================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/firebase.js"; // Conexión a Firestore

// ===============================
// Importación de rutas
// ===============================
import authRoutes from "./routes/authRoutes.js";             // Login y registro
import usuariosRoutes from "./routes/usuariosRoutes.js";     // Gestión de usuarios (solo admin)
import materiasRoutes from "./routes/materiasRoutes.js";     // Gestión de materias (docentes y admin)
import protectedRoutes from "./routes/protectedRoutes.js";   // Rutas protegidas por JWT y roles
import asignacionesRoutes from "./routes/asignacionesRoutes.js";

dotenv.config();
const app = express();

// ===============================
// 🧩 Configuración general del servidor
// ===============================

app.use(cors({
  origin: "http://localhost:5173", // frontend de Vite
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));//app.use(cors());
app.use(express.json());

// ===============================
// 🌐 Ruta raíz (verificación del servidor)
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 MentorProg API funcionando correctamente");
});

// ===============================
// 🔥 Ruta de prueba para Firestore
// ===============================
app.get("/prueba", async (req, res) => {
  try {
    const ref = db.collection("usuarios").doc("usuario1");
    await ref.set({
      nombre: "Kevin Slater",
      rol: "docente",
      fecha_creacion: new Date().toISOString(),
    });

    res.json({
      mensaje: "✅ Conexión exitosa con Firestore y documento creado",
    });
  } catch (error) {
    console.error("❌ Error en /prueba:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// 🧭 Montaje de rutas principales
// ===============================

// Rutas de autenticación (registro, login, perfil)
app.use("/auth", authRoutes);

// Rutas protegidas que requieren JWT y verificación de roles
app.use("/protected", protectedRoutes);

// Rutas de gestión de usuarios (solo accesibles por el rol admin)
app.use("/usuarios", usuariosRoutes);

// Rutas de gestión de materias (accesibles para admin y docentes)
app.use("/materias", materiasRoutes);
app.use("/asignaciones", asignacionesRoutes);
// ===============================
// 📚 Rutas del docente (IA y alumnos por materia)
// ===============================
import alumnosRoutes from "./routes/alumnosRoutes.js";
import iaRoutes from "./routes/iaRoutes.js";
import actividadesRoutes from "./routes/actividadesRoutes.js";
app.use("/alumnos", alumnosRoutes);
app.use("/ia", iaRoutes);
app.use("/actividades", actividadesRoutes);
// ===============================
// 🧱 Manejo de rutas no encontradas
// ===============================
app.use((req, res) => {
  res.status(404).json({
    mensaje: "❌ Ruta no encontrada. Verifica la URL o el método HTTP.",
  });
});

// ===============================
// 🧨 Manejo global de errores del servidor
// ===============================
app.use((err, req, res, next) => {
  console.error("💥 Error interno:", err.stack);
  res.status(500).json({
    mensaje: "Error interno del servidor",
    detalle: err.message,
  });
});

// ===============================
// 📦 Exportación del servidor
// ===============================
export default app;
