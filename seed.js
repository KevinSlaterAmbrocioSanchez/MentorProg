// ===============================
// 🌱 SEED DE INICIALIZACIÓN
// ===============================
import bcrypt from "bcrypt";
import db from "./src/config/firebase.js";

console.log("🌱 Iniciando carga de datos base...");

const usuariosRef = db.collection("usuarios");
const materiasRef = db.collection("materias");

// ===============================
// 🔹 Datos iniciales
// ===============================
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
    rol: "docente",
  },
  {
    nombre: "Alumno Prueba",
    email: "alumno@mentorprog.com",
    password: "alumno123",
    rol: "alumno",
  },
];

const materiasBase = [
  {
    nombre: "Programación Web",
    grupo: "9SC",
    horario: "Lunes 10:00 - 12:00",
    docenteEmail: "docente@mentorprog.com",
  },
  {
    nombre: "Bases de Datos",
    grupo: "9SC",
    horario: "Martes 12:00 - 14:00",
    docenteEmail: "docente@mentorprog.com",
  },
];

// ===============================
// 🔧 Función principal
// ===============================
const ejecutarSeed = async () => {
  try {
    // 🚀 Crear usuarios base
    for (const user of usuariosBase) {
      const existe = await usuariosRef.where("email", "==", user.email).get();
      if (!existe.empty) {
        console.log(`⚠️ Usuario ya existe: ${user.email}`);
        continue;
      }

      const hash = await bcrypt.hash(user.password, 10);
      await usuariosRef.add({
        nombre: user.nombre,
        email: user.email,
        password: hash,
        rol: user.rol,
        creadoEn: new Date().toISOString(),
      });

      console.log(`✅ Usuario creado: ${user.email}`);
    }

    // 🚀 Crear materias base
    for (const materia of materiasBase) {
      const snap = await materiasRef
        .where("nombre", "==", materia.nombre)
        .where("docenteEmail", "==", materia.docenteEmail)
        .get();

      if (!snap.empty) {
        console.log(`⚠️ Materia ya existe: ${materia.nombre}`);
        continue;
      }

      await materiasRef.add({
        ...materia,
        creadaEn: new Date().toISOString(),
      });

      console.log(`📘 Materia creada: ${materia.nombre}`);
    }

    console.log("\n✅ Seed ejecutado correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar el seed:", error.message);
    process.exit(1);
  }
};

ejecutarSeed();
