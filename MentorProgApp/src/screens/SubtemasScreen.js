// MentorProgApp/src/screens/SubtemasScreen.js
import React from "react";
import { View, Text, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DCard from "../components/DCard";

export default function SubtemasScreen({ route, navigation }) {
  const { materiaId, nombreMateria, tema } = route.params;

  // Los subtemas vienen desde Firestore dentro del documento del tema
  const subtemas = Array.isArray(tema.subtemas) ? tema.subtemas : [];

  const manejarIrAQuizzes = (subtemaOriginal) => {
    // Soportar tanto string como objeto
    const subtema =
      typeof subtemaOriginal === "string"
        ? { titulo: subtemaOriginal }
        : subtemaOriginal;

    navigation.navigate("Quizzes", {
      materiaId,
      nombreMateria,
      temaId: tema.id,
      temaTitulo: tema.titulo,
      subtema,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 20, backgroundColor: "#F6F6F6" }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#273B1B",
          marginBottom: 6,
        }}
      >
        {tema.titulo}
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#64748B",
          marginBottom: 18,
        }}
      >
        Materia:{" "}
        <Text style={{ fontWeight: "600", color: "#111827" }}>
          {nombreMateria || "Sin nombre"}
        </Text>
      </Text>

      {subtemas.length === 0 ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#6B7280", fontSize: 16 }}>
            Este tema aún no tiene subtemas registrados.
          </Text>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 14,
              marginTop: 6,
              fontStyle: "italic",
            }}
          >
            Cuando el docente agregue subtemas, aparecerán aquí para que
            puedas estudiar y resolver quizzes.
          </Text>
        </View>
      ) : (
        subtemas.map((sub, index) => {
          const titulo =
            typeof sub === "string"
              ? sub
              : sub.titulo || `Subtema ${index + 1}`;

          return (
            <DCard
              key={index}
              title={titulo}
              icon={<Ionicons name="bulb" size={26} color="#58CC02" />}
              onPress={() => manejarIrAQuizzes(sub)}
            />
          );
        })
      )}
    </ScrollView>
  );
}
