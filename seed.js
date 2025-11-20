// seed.js (en la raíz del proyecto)
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import db from "./src/config/firebase.js";

dotenv.config();

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
    rol: "usuario",
  },
  {
    nombre: "Alumno Prueba",
    email: "alumno@mentorprog.com",
    password: "alumno123",
    rol: "usuario",
  },
];

async function seedUsuarios() {
  try {
    console.log("🚀 Iniciando seed de usuarios...");

    for (const u of usuariosBase) {
      const snap = await db
        .collection("usuarios")
        .where("email", "==", u.email)
        .get();

      if (!snap.empty) {
        console.log(`⚠️  Ya existe ${u.email}, se omite.`);
        continue;
      }

      const hash = await bcrypt.hash(u.password, 10);

      await db.collection("usuarios").add({
        nombre: u.nombre,
        email: u.email,
        password: hash,
        rol: u.rol,
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Usuario creado: ${u.email}`);
    }

    console.log("🎉 Seed terminado.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
}

seedUsuarios();
