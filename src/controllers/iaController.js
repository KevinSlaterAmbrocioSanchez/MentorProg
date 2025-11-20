// src/controllers/iaController.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../config/firebase.js";

dotenv.config();

// Colección de temas (la dejamos igual por si después quieres guardar algo)
const temasRef = db.collection("temas");

// 🔑 Configuración de Gemini
const apiKey = process.env.GEMINI_API_KEY;
const modeloPorDefecto = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!apiKey) {
  console.warn(
    "⚠️ No se encontró GEMINI_API_KEY en .env. Las rutas de IA fallarán."
  );
}

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// 🔹 Generar contenido para un SUBTEMA/TEMA con Gemini
export const generarContenidoTema = async (req, res) => {
  try {
    const { subjectId, temaId, subtemaId, promptManual } = req.body;

    // Validación igual que antes
    if (!subjectId || !temaId || !subtemaId) {
      return res
        .status(400)
        .json({ mensaje: "subjectId, temaId y subtemaId son obligatorios" });
    }

    if (!genAI) {
      return res.status(500).json({
        mensaje:
          "El servidor no tiene configurada la clave de GEMINI. Revisa GEMINI_API_KEY en .env",
      });
    }

    // (Opcional) leer datos del tema desde Firestore (no es obligatorio, pero lo dejo por si después lo usas)
    let datosTema = null;
    try {
      const temaDoc = await temasRef.doc(temaId).get();
      if (temaDoc.exists) {
        datosTema = temaDoc.data();
      }
    } catch (e) {
      // Si falla, no rompemos nada, solo lo ignoramos.
      console.warn("⚠️ No se pudo leer el tema desde Firestore:", e.message);
    }

    const basePrompt = `
Eres un tutor para estudiantes de Ingeniería en Sistemas Computacionales.

Genera una explicación clara, bien estructurada y didáctica para el subtema con:
- ID de materia (subjectId): ${subjectId}
- ID de tema (temaId): ${temaId}
- ID de subtema (subtemaId): ${subtemaId}

${
  datosTema
    ? `Información adicional del tema (opcional, si sirve de contexto):
Título del tema: ${datosTema.titulo || "N/A"}
Descripción del tema: ${datosTema.descripcion || "N/A"}`
    : ""
}

Nivel: básico/intermedio de universidad.
Usa ejemplos sencillos, lenguaje cercano y evita párrafos extremadamente largos.

Estructura sugerida:
1. Introducción corta al subtema
2. Desarrollo en 3 a 5 apartados con subtítulos
3. Uno o dos ejemplos simples
4. Cierre o resumen final
`;

    const finalPrompt = promptManual
      ? `${basePrompt}\n\nEl administrador agregó esta indicación extra:\n${promptManual}`
      : basePrompt;

    // 👇 Cliente oficial de Gemini
    const model = genAI.getGenerativeModel({
      // IMPORTANTE: solo el nombre del modelo, SIN "models/"
      model: modeloPorDefecto,
    });

    const result = await model.generateContent(finalPrompt);
    const response = result.response;
    const texto = response.text() || "No se generó contenido.";

    // Si luego quieres guardar el texto:
    // await temasRef.doc(temaId).collection("subtemas").doc(subtemaId).update({ contenido: texto });

    return res.json({
      mensaje: "✅ Contenido generado correctamente",
      contenido: texto,
    });
  } catch (error) {
    console.error(
      "❌ Error en generarContenidoTema:",
      error?.response?.error || error.message || error
    );

    const mensajeErrorBackend =
      error?.response?.error?.message ||
      error.message ||
      "Error al generar contenido con Gemini";

    return res.status(500).json({
      mensaje: "Error al generar contenido con Gemini",
      detalle: mensajeErrorBackend,
    });
  }
};
