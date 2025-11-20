// src/controllers/alumnosController.js
import admin from "firebase-admin";
import db from "../config/firebase.js";

const auth = admin.auth();

// Colecciones
const usuariosRef = db.collection("usuarios");
// ⚠️ Si tu colección se llama "clases", cambia a: db.collection("clases");
const materiasRef = db.collection("materias");

// Helper para mapear documento de Firestore → objeto alumno
const docToAlumno = (d) => ({ id: d.id, uid: d.id, ...d.data() });

/**
 * GET /alumnos
 * Lista todos los alumnos (rol = "alumno")
 */
export const listarAlumnos = async (req, res) => {
  try {
    const snap = await usuariosRef.where("rol", "==", "alumno").get();
    const alumnos = snap.docs.map(docToAlumno);
    return res.json({ alumnos });
  } catch (e) {
    console.error("listarAlumnos ERROR:", e);
    return res.status(500).json({
      mensaje: "Error al listar alumnos",
      detalle: e?.message,
      code: e?.code,
    });
  }
};

/**
 * GET /alumnos/buscar?numControl=XYZ
 * Busca un alumno por número de control
 */
export const buscarPorNumControl = async (req, res) => {
  try {
    const { numControl } = req.query;
    if (!numControl) return res.status(400).json({ mensaje: "numControl es requerido" });

    const q = await usuariosRef
      .where("rol", "==", "alumno")
      .where("numControl", "==", String(numControl).trim())
      .limit(1)
      .get();

    if (q.empty) return res.status(404).json({ mensaje: "Alumno no encontrado" });

    const alumno = docToAlumno(q.docs[0]);
    return res.json({ alumno });
  } catch (e) {
    console.error("buscarPorNumControl ERROR:", e);
    return res.status(500).json({ mensaje: "Error al buscar alumno" });
  }
};

/**
 * POST /alumnos
 * Body: { nombre, numControl, semestre, email, password }
 * Crea usuario en Firebase Auth y documento en Firestore, con fallback a solo Firestore
 */
export const crearAlumno = async (req, res) => {
  try {
    const { nombre, numControl, semestre, email, password } = req.body;

    if (!nombre || !numControl || !semestre || !email || !password) {
      return res
        .status(400)
        .json({ mensaje: "nombre, numControl, semestre, email y password son obligatorios" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Duplicados por numControl y por email en la colección usuarios
    const dupNc = await usuariosRef
      .where("rol", "==", "alumno")
      .where("numControl", "==", String(numControl).trim())
      .limit(1)
      .get();
    if (!dupNc.empty) return res.status(409).json({ mensaje: "Ya existe un alumno con ese número de control" });

    const dupEmail = await usuariosRef.where("email", "==", String(email).trim()).limit(1).get();
    if (!dupEmail.empty) return res.status(409).json({ mensaje: "El correo ya está registrado" });

    // ===== Paso 1: Intentar crear también en Firebase Auth =====
    try {
      const user = await auth.createUser({
        displayName: nombre,
        email: String(email).trim(),
        password: String(password),
        emailVerified: false,
        disabled: false,
      });
      await auth.setCustomUserClaims(user.uid, { rol: "alumno" });

      const payload = {
        uid: user.uid,
        nombre: nombre.trim(),
        numControl: String(numControl).trim(),
        semestre: Number(semestre),
        email: String(email).trim(),
        rol: "alumno",
        creadoEn: admin.firestore.FieldValue.serverTimestamp(),
      };
      await usuariosRef.doc(user.uid).set(payload);

      return res.status(201).json({ alumno: { id: user.uid, ...payload }, auth: "ok" });
    } catch (authErr) {
      // ===== Paso 2 (fallback): si Auth falla por configuración, guardamos SOLO en Firestore =====
      if (authErr?.code === "auth/configuration-not-found") {
        const docRef = usuariosRef.doc(); // generamos un id local para el alumno
        const payload = {
          uid: docRef.id,
          nombre: nombre.trim(),
          numControl: String(numControl).trim(),
          semestre: Number(semestre),
          email: String(email).trim(),
          rol: "alumno",
          creadoEn: admin.firestore.FieldValue.serverTimestamp(),
          _needsAuth: true, // marca para migrar a Auth después
        };
        await docRef.set(payload);

        return res.status(201).json({
          alumno: { id: docRef.id, ...payload },
          auth: "skipped",
          motivo: "auth/configuration-not-found",
        });
      }

      // Otros errores de Auth sí se devuelven tal cual
      if (authErr?.code === "auth/email-already-exists") {
        return res.status(409).json({ mensaje: "El correo ya está en uso", code: authErr.code });
      }
      if (authErr?.code === "auth/invalid-password") {
        return res.status(400).json({ mensaje: "Contraseña inválida (mínimo 6)", code: authErr.code });
      }
      console.error("crearAlumno AUTH ERROR:", authErr);
      return res.status(500).json({ mensaje: "Error al crear alumno", detalle: authErr.message, code: authErr.code });
    }
  } catch (e) {
    console.error("crearAlumno ERROR:", e);
    return res.status(500).json({ mensaje: "Error al crear alumno", detalle: e?.message, code: e?.code });
  }
};

/**
 * PUT /alumnos/:uid
 * Body: { nombre?, numControl?, semestre?, email?, password? }
 * Actualiza datos en Auth (si aplica) y Firestore
 */
export const actualizarAlumno = async (req, res) => {
  try {
    const { uid } = req.params;
    const { nombre, numControl, semestre, email, password } = req.body;

    if (!uid) return res.status(400).json({ mensaje: "uid requerido" });

    const doc = await usuariosRef.doc(uid).get();
    if (!doc.exists) return res.status(404).json({ mensaje: "Alumno no encontrado" });

    // Updates en Auth
    const updatesAuth = {};
    if (email) updatesAuth.email = String(email).trim();
    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
      }
      updatesAuth.password = String(password);
    }
    if (nombre) updatesAuth.displayName = nombre;

    if (Object.keys(updatesAuth).length) {
      await auth.updateUser(uid, updatesAuth);
    }

    // Updates en Firestore
    const updatesFS = {};
    if (nombre !== undefined) updatesFS.nombre = nombre.trim();
    if (numControl !== undefined) updatesFS.numControl = String(numControl).trim();
    if (semestre !== undefined) updatesFS.semestre = Number(semestre);
    if (email !== undefined) updatesFS.email = String(email).trim();

    if (Object.keys(updatesFS).length) {
      updatesFS.actualizadoEn = admin.firestore.FieldValue.serverTimestamp();
      await usuariosRef.doc(uid).update(updatesFS);
    }

    const updated = await usuariosRef.doc(uid).get();
    return res.json({ alumno: docToAlumno(updated) });
  } catch (e) {
    console.error("actualizarAlumno ERROR:", e);
    return res.status(500).json({ mensaje: "Error al actualizar alumno" });
  }
};

/**
 * DELETE /alumnos/:uid
 * Borra de Auth y Firestore
 * Limpia la subcolección alumnos dentro de todas las materias
 */
export const eliminarAlumno = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ mensaje: "uid requerido" });

    // Auth
    try {
      await auth.deleteUser(uid);
    } catch (e) {
      // Si ya no existe en Auth, continuamos
      console.warn("deleteUser warning:", e?.code);
    }

    // Firestore
    await usuariosRef.doc(uid).delete();

    // Quitar de todas las materias (subcolecciones)
    const matsSnap = await materiasRef.get();
    const batch = db.batch();
    matsSnap.forEach((mDoc) => {
      const alumSub = mDoc.ref.collection("alumnos").doc(uid);
      batch.delete(alumSub);
    });
    await batch.commit();

    return res.json({ ok: true });
  } catch (e) {
    console.error("eliminarAlumno ERROR:", e);
    return res.status(500).json({ mensaje: "Error al eliminar alumno" });
  }
};

/**
 * POST /materias/:materiaId/alumnos
 * Body: { alumnoId }
 * Añade un alumno a la subcolección alumnos de la materia
 */
export const asignarAlumnoAMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const { alumnoId } = req.body;

    if (!materiaId || !alumnoId) {
      return res.status(400).json({ mensaje: "materiaId y alumnoId son requeridos" });
    }

    const userDoc = await usuariosRef.doc(alumnoId).get();
    if (!userDoc.exists) return res.status(404).json({ mensaje: "Alumno no encontrado" });
    if (userDoc.data().rol !== "alumno")
      return res.status(400).json({ mensaje: "El usuario no es alumno" });

    const matDoc = await materiasRef.doc(materiaId).get();
    if (!matDoc.exists) return res.status(404).json({ mensaje: "Materia no encontrada" });

    await materiasRef
      .doc(materiaId)
      .collection("alumnos")
      .doc(alumnoId)
      .set({
        uid: alumnoId,
        nombre: userDoc.data().nombre,
        numControl: userDoc.data().numControl,
        email: userDoc.data().email,
        semestre: userDoc.data().semestre,
        agregadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });

    return res.json({ ok: true });
  } catch (e) {
    console.error("asignarAlumnoAMateria ERROR:", e);
    return res.status(500).json({ mensaje: "Error al asignar alumno a la materia" });
  }
};

// 🔁 Alias para compatibilidad con rutas antiguas que importan asignarAlumnoAClase
export const asignarAlumnoAClase = asignarAlumnoAMateria;