// ===============================
// 👤 Controlador de Usuarios
// ===============================
import db from "../config/firebase.js";
import bcrypt from "bcrypt";

const usuariosRef = db.collection("usuarios");

// ===============================
// 🔹 Obtener todos los usuarios (solo admin)
// ===============================
export const obtenerUsuarios = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const snap = await usuariosRef.get();
    const usuarios = snap.docs.map((doc) => {
      const data = doc.data();
      delete data.password; // 🔒 No mostrar contraseñas
      return { id: doc.id, ...data };
    });

    res.json({ total: usuarios.length, usuarios });
  } catch (e) {
    console.error("❌ Error al obtener usuarios:", e);
    res.status(500).json({ error: e.message });
  }
};

// ===============================
// 🔹 Obtener solo docentes (para asignar materias)
// ===============================
export const obtenerDocentes = async (req, res) => {
  try {
    // Solo los admins pueden ver la lista de docentes
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const snap = await usuariosRef.where("rol", "==", "docente").get();

    if (snap.empty) {
      return res.json({ total: 0, docentes: [] });
    }

    const docentes = snap.docs.map((doc) => {
      const data = doc.data();
      delete data.password;
      return {
        id: doc.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
      };
    });

    res.json({ total: docentes.length, docentes });
  } catch (e) {
    console.error("❌ Error al obtener docentes:", e);
    res.status(500).json({ error: e.message });
  }
};

// ===============================
// 🔹 Obtener usuario por ID (admin o dueño)
// ===============================
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await usuariosRef.doc(id).get();

    if (!doc.exists)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const usuario = { id: doc.id, ...doc.data() };
    delete usuario.password;

    // Solo el admin o el propio usuario pueden acceder
    if (req.usuario.rol !== "admin" && req.usuario.email !== usuario.email) {
      return res.status(403).json({
        mensaje: "Acceso denegado. No tienes permiso para ver este usuario.",
      });
    }

    res.json(usuario);
  } catch (e) {
    console.error("❌ Error al obtener usuario:", e);
    res.status(500).json({ error: e.message });
  }
};

// ===============================
// 🔹 Ver perfil del usuario autenticado (cualquier rol)
// ===============================
export const miPerfil = async (req, res) => {
  try {
    const snap = await usuariosRef.where("email", "==", req.usuario.email).get();
    if (snap.empty)
      return res.status(404).json({ mensaje: "Perfil no encontrado" });

    const doc = snap.docs[0];
    const usuario = { id: doc.id, ...doc.data() };
    delete usuario.password;

    res.json(usuario);
  } catch (e) {
    console.error("❌ Error al obtener perfil:", e);
    res.status(500).json({ error: e.message });
  }
};

// ===============================
// 🔹 Crear un nuevo usuario (solo admin)
// ===============================
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol = "alumno" } = req.body;

    if (!nombre || !email || !password)
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });

    const existe = await usuariosRef.where("email", "==", email).get();
    if (!existe.empty)
      return res.status(400).json({ mensaje: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = {
      nombre,
      email,
      password: hash,
      rol,
      creadoEn: new Date().toISOString(),
    };

    const ref = await usuariosRef.add(nuevoUsuario);

    res.status(201).json({
      mensaje: "✅ Usuario creado correctamente",
      id: ref.id,
      usuario: { nombre, email, rol },
    });
  } catch (e) {
    console.error("❌ Error al crear usuario:", e);
    res.status(500).json({ error: e.message });
  }
};

// ===============================
// 🔹 Actualizar usuario (admin o dueño)
// ===============================
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, password, rol } = req.body;

    const docRef = usuariosRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const actual = doc.data();

    // Solo el propio usuario o el admin pueden editar
    if (req.usuario.rol !== "admin" && req.usuario.email !== actual.email) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (rol && req.usuario.rol === "admin") updateData.rol = rol;

    await docRef.update(updateData);

    res.json({ mensaje: "✅ Usuario actualizado correctamente" });
  } catch (e) {
    console.error("❌ Error al actualizar usuario:", e);
    res.status(500).json({ error: e.message });
  }
};

// ===============================
// 🔹 Eliminar usuario (solo admin)
// ===============================
export const eliminarUsuario = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    const { id } = req.params;
    const docRef = usuariosRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    await docRef.delete();
    res.json({ mensaje: "🗑️ Usuario eliminado correctamente" });
  } catch (e) {
    console.error("❌ Error al eliminar usuario:", e);
    res.status(500).json({ error: e.message });
  }
};
