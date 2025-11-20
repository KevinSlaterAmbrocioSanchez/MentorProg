// src/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/firebase.js";

const usuariosRef = db.collection("usuarios");

// ============ REGISTRO ============
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    const existente = await usuariosRef.where("email", "==", email).get();
    if (!existente.empty) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    await usuariosRef.add({
      nombre,
      email,
      password: hash,          // 👈 siempre guardamos HASH
      rol: rol || "usuario",
      creadoEn: new Date().toISOString(),
    });

    return res
      .status(201)
      .json({ mensaje: "✅ Usuario registrado correctamente" });
  } catch (error) {
    console.error("❌ Error en registrarUsuario:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ============ LOGIN ============

// src/controllers/authController.js
// ... resto igual ...

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: "Faltan credenciales" });
    }

    const snapshot = await usuariosRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const doc = snapshot.docs[0];
    const usuario = doc.data();

    if (!usuario.password) {
      return res
        .status(401)
        .json({ mensaje: "Usuario sin contraseña registrada" });
    }

    let esValido = false;
    const passGuardada = usuario.password.toString();

    if (
      passGuardada.startsWith("$2a$") ||
      passGuardada.startsWith("$2b$") ||
      passGuardada.startsWith("$2y$")
    ) {
      esValido = await bcrypt.compare(password, passGuardada);
    } else {
      esValido = password === passGuardada;
    }

    if (!esValido) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    const rolBD = usuario.rol || "usuario";
    const rol = rolBD === "admin" ? "admin" : "usuario";

    const token = jwt.sign(
      {
        id: doc.id,
        nombre: usuario.nombre || "Sin nombre",
        email: usuario.email,
        rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      mensaje: "✅ Login exitoso",
      token,
      usuario: {
        id: doc.id,
        nombre: usuario.nombre || "Sin nombre",
        email: usuario.email,
        rol,
      },
    });
  } catch (error) {
    console.error("❌ Error en loginUsuario:", error);
    return res.status(500).json({ error: error.message });
  }
};
