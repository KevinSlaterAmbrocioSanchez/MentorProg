// src/seed.js
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import db from "./config/firebase.js";

dotenv.config();

// 👇 Aquí defines tus usuarios base
const usuariosBase = [
  {
    nombre: "Administrador Principal",
    email: "admin@mentorprog.com",
    password: "admin123",
    rol: "admin",
  },
  {
    nombre: "Docente Ejemplo",
    email: "docente@mentorprog.com",
    password: "docente123",
    rol: "usuario",        // 👈 ya no rol "docente", solo admin/usuario
  },
  {
    nombre: "Alumno Prueba",
    email: "alumno@mentorprog.com",
    password: "alumno123",
    rol: "usuario",
  },
];

// Función principal
async function seedUsuarios() {
  try {
    console.log("🚀 Iniciando seed de usuarios...");

    for (const u of usuariosBase) {
      // ¿Ya existe ese correo?
      const snap = await db
        .collection("usuarios")
        .where("email", "==", u.email)
        .get();

      if (!snap.empty) {
        console.log(`⚠️  Ya existe el usuario ${u.email}, se omite.`);
        continue;
      }

      // Hasheamos la contraseña para que sea compatible con tu login
      const hash = await bcrypt.hash(u.password, 10);

      await db.collection("usuarios").add({
        nombre: u.nombre,
        email: u.email,
        password: hash,
        rol: u.rol,
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Usuario creado: ${u.email} (rol: ${u.rol})`);
    }

    console.log("🎉 Seed de usuarios terminado.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  }
}

seedUsuarios();
