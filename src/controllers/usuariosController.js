// src/controllers/usuariosController.js
import db from "../config/firebase.js";
import bcrypt from "bcryptjs";

const usuariosRef = db.collection("usuarios");

// 🔹 Listar todos los usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const snapshot = await usuariosRef.get();

    const usuarios = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || "",
        email: data.email || "",
        rol: data.rol || "alumno", // admin | docente | alumno
        creadoEn: data.creadoEn || null,
      };
    });

    return res.json(usuarios);
  } catch (error) {
    console.error("❌ Error en listarUsuarios:", error);
    return res.status(500).json({ mensaje: "Error al listar usuarios" });
  }
};

// 🔹 Crear nuevo usuario (desde módulo de Gestión de Usuarios)
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Nombre, email y contraseña son obligatorios" });
    }

    // ¿Ya existe ese correo?
    const existe = await usuariosRef.where("email", "==", email).get();
    if (!existe.empty) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      nombre,
      email,
      password: hash,
      rol: rol || "alumno", // por defecto alumno
      creadoEn: new Date().toISOString(),
    };

    const docRef = await usuariosRef.add(nuevoUsuario);

    return res.status(201).json({
      mensaje: "✅ Usuario creado correctamente",
      id: docRef.id,
    });
  } catch (error) {
    console.error("❌ Error en crearUsuario:", error);
    return res.status(500).json({ mensaje: "Error al crear usuario" });
  }
};

// 🔹 Actualizar datos (nombre, email, rol)
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const docRef = usuariosRef.doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (rol) updates.rol = rol;

    // Si quiere cambiar el email, validamos que no exista otro usuario con ese correo
    if (email) {
      const existente = await usuariosRef
        .where("email", "==", email)
        .get();

      const yaUsadoPorOtro = existente.docs.find((d) => d.id !== id);
      if (yaUsadoPorOtro) {
        return res
          .status(400)
          .json({ mensaje: "Ese correo ya está en uso por otro usuario" });
      }

      updates.email = email;
    }

    await docRef.update(updates);

    return res.json({ mensaje: "✅ Usuario actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error en actualizarUsuario:", error);
    return res.status(500).json({ mensaje: "Error al actualizar usuario" });
  }
};

// 🔹 Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = usuariosRef.doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    await docRef.delete();

    return res.json({ mensaje: "✅ Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error en eliminarUsuario:", error);
    return res.status(500).json({ mensaje: "Error al eliminar usuario" });
  }
};

// 🔹 Obtener lista de docentes (para combos, asignaciones, etc.)
export const obtenerDocentes = async (req, res) => {
  try {
    const snapshot = await usuariosRef.where("rol", "==", "docente").get();

    const docentes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || "",
        email: data.email || "",
        rol: data.rol || "docente",
      };
    });

    return res.json(docentes);
  } catch (error) {
    console.error("❌ Error en obtenerDocentes:", error);
    return res.status(500).json({ mensaje: "Error al obtener docentes" });
  }
};
