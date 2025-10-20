import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

const usuariosRef = db.collection("usuarios");

// 🔹 Registro de usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password)
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });

    const existente = await usuariosRef.where("email", "==", email).get();
    if (!existente.empty)
      return res.status(400).json({ mensaje: "El usuario ya existe" });

    const hash = await bcrypt.hash(password, 10);
    await usuariosRef.add({ nombre, email, password: hash, rol });

    res.status(201).json({ mensaje: "✅ Usuario registrado correctamente" });
  } catch (error) {
    console.error("❌ Error en registrarUsuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Login de usuario
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ mensaje: "Faltan credenciales" });

    const snapshot = await usuariosRef.where("email", "==", email).get();
    if (snapshot.empty)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    // Obtenemos los datos del usuario desde Firestore
    const doc = snapshot.docs[0];
    const usuario = doc.data();

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido)
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    // ✅ Log para verificar qué datos tiene el usuario
    console.log("🧩 Usuario autenticado:", usuario);

    // 🔑 Generamos el token con todos los datos importantes
    const token = jwt.sign(
      {
        id: doc.id, // Guarda también el ID de Firestore
        nombre: usuario.nombre || "Sin nombre",
        email: usuario.email,
        rol: usuario.rol || "alumno",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // ✅ Log para verificar qué payload tiene el token
    const decoded = jwt.decode(token);
    console.log("📦 Payload del token:", decoded);

    res.json({
      mensaje: "✅ Login exitoso",
      token,
    });
  } catch (error) {
    console.error("❌ Error en loginUsuario:", error);
    res.status(500).json({ error: error.message });
  }
};
