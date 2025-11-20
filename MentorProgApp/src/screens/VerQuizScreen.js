// src/screens/VerQuizScreen.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function VerQuizScreen({ route, navigation }) {
  const { quiz } = route.params;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#F6F6F6" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#273B1B", marginBottom: 20 }}>
        {quiz.titulo}
      </Text>

      <Text style={{ fontSize: 18, color: "#374151", marginBottom: 20 }}>
        {quiz.descripcion}
      </Text>

      <Text style={{ fontSize: 16, color: "#6b7280", marginBottom: 40 }}>
        Preguntas: {quiz.preguntas?.length}
      </Text>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ResolverQuiz", {
            quizId: quiz.id,
            preguntas: quiz.preguntas,
          })
        }
        style={{
          backgroundColor: "#58CC02",
          padding: 16,
          borderRadius: 20,
        }}
      >
        <Text style={{ textAlign: "center", color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          Comenzar Quiz
        </Text>
      </TouchableOpacity>
    </View>
  );
}

