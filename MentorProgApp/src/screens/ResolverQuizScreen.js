// MentorProgApp/src/screens/ResolverQuizScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  obtenerQuizPorId,
  enviarRespuestasQuiz,
} from "../api/quizzesService";

export default function ResolverQuizScreen({ route, navigation }) {
  const {
    quizId,
    quiz: quizDesdeLista, // opcional, puede venir desde QuizzesScreen
    materiaId,
    nombreMateria,
    temaId,
    temaTitulo,
    subtemaTitulo,
  } = route.params;

  const { token } = useAuth();

  const [quiz, setQuiz] = useState(quizDesdeLista || null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [selecciones, setSelecciones] = useState({});
  const [resultado, setResultado] = useState(null);

  // 1. Cargar quiz desde backend si no trae preguntas
  const cargarQuiz = async () => {
    setCargando(true);

    // Si ya viene el quiz con preguntas desde QuizzesScreen, lo usamos
    if (quizDesdeLista && Array.isArray(quizDesdeLista.preguntas)) {
      setQuiz(quizDesdeLista);
      setCargando(false);
      return;
    }

    // Si no, lo pedimos al backend
    const resp = await obtenerQuizPorId(token, quizId);
    if (resp.ok) {
      setQuiz(resp.quiz);
    } else {
      Alert.alert("Error", resp.mensaje || "No se pudo cargar el quiz.");
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarQuiz();
  }, []);

  const preguntas = Array.isArray(quiz?.preguntas) ? quiz.preguntas : [];

  // 2. Manejar selección de opción
  const seleccionarOpcion = (preguntaId, indiceOpcion) => {
    setSelecciones((prev) => ({
      ...prev,
      [preguntaId]: indiceOpcion,
    }));
  };

  // 3. Enviar respuestas al backend
  const manejarEnviar = async () => {
    if (!preguntas.length) {
      Alert.alert("Sin preguntas", "Este quiz no tiene preguntas.");
      return;
    }

    // Validar que se hayan respondido todas
    const faltantes = preguntas.filter(
      (p) =>
        selecciones[p.id] === undefined &&
        selecciones[String(p.id)] === undefined
    );

    if (faltantes.length > 0) {
      Alert.alert(
        "Faltan respuestas",
        "Resuelve todas las preguntas antes de enviar."
      );
      return;
    }

    // Construir objeto respuestas { "1": 2, "2": 0, ... }
    const respuestas = {};
    preguntas.forEach((p) => {
      const keyStr = String(p.id);
      if (selecciones[p.id] !== undefined) {
        respuestas[p.id] = selecciones[p.id];
      } else if (selecciones[keyStr] !== undefined) {
        respuestas[keyStr] = selecciones[keyStr];
      }
    });

    setEnviando(true);
    const resp = await enviarRespuestasQuiz(token, quizId, respuestas, {
  materiaId,
  temaId,
  subtemaTitulo,
});

    setEnviando(false);

    if (!resp.ok) {
      Alert.alert("Error", resp.mensaje || "No se pudo enviar el quiz.");
      return;
    }

    setResultado(resp.resultado);
  };

  // 4. Render de opciones tipo Duolingo
  const renderOpcion = (pregunta, opcion, index) => {
    const id = pregunta.id;

    // Texto que se va a mostrar
    const opcionTexto =
      typeof opcion === "string"
        ? opcion
        : opcion?.texto ?? `Opción ${index + 1}`;

    const seleccionActual =
      selecciones[id] !== undefined
        ? selecciones[id]
        : selecciones[String(id)];

    const seleccionada = seleccionActual === index;

    return (
      <TouchableOpacity
        key={opcion.id || index}
        onPress={() => seleccionarOpcion(id, index)}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          borderWidth: seleccionada ? 0 : 1,
          borderColor: "#E5E7EB",
          backgroundColor: seleccionada ? "#58CC02" : "#FFFFFF",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: seleccionada ? "#FFFFFF" : "#111827",
            fontWeight: seleccionada ? "700" : "500",
          }}
        >
          {opcionTexto}
        </Text>
      </TouchableOpacity>
    );
  };

  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F6F6F6",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#58CC02" />
        <Text style={{ marginTop: 8, color: "#64748B" }}>
          Cargando quiz...
        </Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F6F6F6",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#6B7280", fontSize: 16 }}>
          No se pudo cargar el quiz.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 20, backgroundColor: "#F6F6F6" }}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#273B1B",
          marginBottom: 6,
        }}
      >
        {quiz.titulo || "Quiz"}
      </Text>

      {nombreMateria && (
        <Text style={{ fontSize: 14, color: "#64748B" }}>
          Materia:{" "}
          <Text style={{ fontWeight: "600", color: "#111827" }}>
            {nombreMateria}
          </Text>
        </Text>
      )}

      {temaTitulo && (
        <Text style={{ fontSize: 14, color: "#64748B" }}>
          Tema:{" "}
          <Text style={{ fontWeight: "600", color: "#111827" }}>
            {temaTitulo}
          </Text>
        </Text>
      )}

      {subtemaTitulo && (
        <Text
          style={{
            fontSize: 14,
            color: "#22C55E",
            marginBottom: 12,
            marginTop: 2,
          }}
        >
          Subtema: {subtemaTitulo}
        </Text>
      )}

      {quiz.descripcion ? (
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            marginBottom: 16,
          }}
        >
          {quiz.descripcion}
        </Text>
      ) : null}

      {/* Resultado si ya se envió */}
      {resultado && (
        <View
          style={{
            backgroundColor: "#ECFDF3",
            borderRadius: 16,
            padding: 14,
            marginBottom: 18,
            borderWidth: 1,
            borderColor: "#BBF7D0",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#166534",
              marginBottom: 4,
            }}
          >
            Resultado:
          </Text>
          <Text style={{ color: "#166534" }}>
            Respuestas correctas:{" "}
            <Text style={{ fontWeight: "700" }}>
              {resultado.correctas} / {resultado.total}
            </Text>
          </Text>
          <Text style={{ color: "#166534" }}>
            Puntaje:{" "}
            <Text style={{ fontWeight: "700" }}>
              {resultado.porcentaje}%
            </Text>
          </Text>
        </View>
      )}

      {/* Preguntas */}
      {preguntas.length === 0 ? (
        <Text style={{ color: "#6B7280", fontSize: 16 }}>
          Este quiz no tiene preguntas registradas.
        </Text>
      ) : (
        preguntas.map((p, idx) => (
          <View
            key={p.id || idx}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 10,
              }}
            >
              {idx + 1}. {p.texto || p.enunciado || "Pregunta"}
            </Text>

            {Array.isArray(p.opciones)
              ? p.opciones.map((op, i) => renderOpcion(p, op, i))
              : null}
          </View>
        ))
      )}

      {/* Botón Enviar */}
      <TouchableOpacity
        onPress={manejarEnviar}
        disabled={enviando || !preguntas.length}
        style={{
          backgroundColor: enviando ? "#A7F3D0" : "#58CC02",
          paddingVertical: 14,
          borderRadius: 24,
          alignItems: "center",
          marginTop: 10,
          marginBottom: 30,
          opacity: preguntas.length === 0 ? 0.6 : 1,
        }}
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Enviar respuestas
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
