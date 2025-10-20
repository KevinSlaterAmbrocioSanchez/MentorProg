import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const generarActividadIA = async (req, res) => {
  try {
    const { materia, descripcion } = req.body;

    if (!materia || !descripcion) {
      return res.status(400).json({ mensaje: "Faltan datos para generar la actividad." });
    }

    console.log("✅ Generando actividad para:", materia);

    // 🔹 Llamada directa al modelo gemini-1.5-flash (v1)
    const response = await axios.post(
  "https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateContent",
  



      {
        contents: [
          {
            parts: [
              {
                text: `
                  Genera una actividad educativa para la materia "${materia}".
                  Descripción base: ${descripcion}.
                  Incluye:
                  - Un título breve.
                  - Instrucciones claras para el alumno.
                  - Criterios de evaluación (en puntos).
                  - Nivel de dificultad (básico, intermedio o avanzado).
                `,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const textoGenerado =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se generó contenido.";

    res.status(200).json({
      mensaje: "✅ Actividad generada correctamente.",
      actividad: {
        materia,
        descripcion,
        contenido: textoGenerado,
        fechaCreacion: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Error con Gemini:", error.response?.data || error.message);
    res.status(500).json({
      mensaje: "Error al generar la actividad con Gemini.",
      detalle: error.response?.data || error.message,
    });
  }
};
