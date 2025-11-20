// MentorProgApp/src/screens/TemasScreen.js
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
import { obtenerTemasDeMateria } from "../api/materiasService";
import DCard from "../components/DCard";

export default function TemasScreen({ route, navigation }) {
  const { materiaId, nombreMateria } = route.params;
  const { token } = useAuth();

  const [temas, setTemas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarTemas = async () => {
    setCargando(true);
    const resp = await obtenerTemasDeMateria(token, materiaId);

    if (resp.ok) {
      setTemas(resp.temas);
    } else {
      setTemas([]);
    }

    setCargando(false);
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cargarTemas();
    setRefrescando(false);
  };

  useEffect(() => {
    cargarTemas();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, padding: 20, backgroundColor: "#F6F6F6" }}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
      }
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#273B1B",
          marginBottom: 6,
        }}
      >
        Temas de {nombreMateria || "la materia"}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: "#64748B",
          marginBottom: 20,
        }}
      >
        Elige un tema para ver sus subtemas y quizzes.
      </Text>

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
            Cargando temas...
          </Text>
        </View>
      ) : temas.length === 0 ? (
        <Text style={{ color: "#6B7280", fontSize: 16 }}>
          Aún no hay temas registrados para esta materia.
        </Text>
      ) : (
        temas.map((tema) => (
          <DCard
            key={tema.id}
            title={tema.titulo}
            icon={<Ionicons name="school" size={26} color="#58CC02" />}
            onPress={() =>
              navigation.navigate("Subtemas", {
                materiaId,
                nombreMateria,
                tema,
              })
            }
          />
        ))
      )}
    </ScrollView>
  );
}
