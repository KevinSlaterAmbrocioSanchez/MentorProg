// MentorProgApp/src/screens/QuizzesScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";
import { obtenerQuizzesDeTema } from "../api/quizzesService";
import DCard from "../components/DCard";

export default function QuizzesScreen({ route, navigation }) {
  const { materiaId, nombreMateria, temaId, temaTitulo, subtema } = route.params;
  const { token } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const tituloSubtema =
    typeof subtema === "string" ? subtema : subtema?.titulo || "";

  const cargarQuizzes = async () => {
    setCargando(true);

    const resp = await obtenerQuizzesDeTema(
      token,
      materiaId,
      temaId,
      tituloSubtema || null
    );

    if (resp.ok) {
      setQuizzes(resp.quizzes || []);
    } else {
      setQuizzes([]);
    }

    setCargando(false);
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cargarQuizzes();
    setRefrescando(false);
  };

  useEffect(() => {
    cargarQuizzes();
  }, []);

  const manejarResolverQuiz = (quiz) => {
    // Navegamos directo a ResolverQuiz con el ID y, si viene, preguntas
    navigation.navigate("ResolverQuiz", {
      quizId: quiz.id,
      quiz, // por si ResolverQuiz quiere más info (titulo, etc.)
      materiaId,
      nombreMateria,
      temaId,
      temaTitulo,
      subtemaTitulo: tituloSubtema,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 20, backgroundColor: "#F6F6F6" }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
      }
    >
      {/* Encabezado */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#273B1B",
          marginBottom: 4,
        }}
      >
        Quizzes
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#64748B",
          marginBottom: 4,
        }}
      >
        Materia:{" "}
        <Text style={{ fontWeight: "600", color: "#111827" }}>
          {nombreMateria || "Sin nombre"}
        </Text>
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#64748B",
          marginBottom: 14,
        }}
      >
        Tema:{" "}
        <Text style={{ fontWeight: "600", color: "#111827" }}>
          {temaTitulo || "Sin título"}
        </Text>
      </Text>

      {tituloSubtema ? (
        <Text
          style={{
            fontSize: 14,
            color: "#22C55E",
            marginBottom: 18,
            fontWeight: "500",
          }}
        >
          Subtema: {tituloSubtema}
        </Text>
      ) : (
        <Text
          style={{
            fontSize: 14,
            color: "#94A3B8",
            marginBottom: 18,
            fontStyle: "italic",
          }}
        >
          No se especificó subtema.
        </Text>
      )}

      {/* Contenido */}
      {cargando ? (
        <View
          style={{
            marginTop: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#58CC02" />
          <Text
            style={{
              marginTop: 10,
              color: "#64748B",
              fontSize: 15,
            }}
          >
            Cargando quizzes...
          </Text>
        </View>
      ) : quizzes.length === 0 ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#6B7280", fontSize: 16 }}>
            Aún no hay quizzes registrados para este subtema.
          </Text>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 14,
              marginTop: 6,
              fontStyle: "italic",
            }}
          >
            Cuando el docente cree quizzes, podrás practicar aquí.
          </Text>
        </View>
      ) : (
        quizzes.map((quiz, index) => {
          const numPreguntas = Array.isArray(quiz.preguntas)
            ? quiz.preguntas.length
            : quiz.totalPreguntas || 0;

          return (
            <DCard
              key={quiz.id || index}
              title={quiz.titulo || `Quiz ${index + 1}`}
              icon={<Ionicons name="help-circle" size={26} color="#58CC02" />}
              onPress={() => manejarResolverQuiz(quiz)}
            >
              {/* Si quisieras extender DCard para children, se puede;
                  por ahora lo mantenemos simple solo con título e icono */}
            </DCard>
          );
        })
      )}
    </ScrollView>
  );
}
