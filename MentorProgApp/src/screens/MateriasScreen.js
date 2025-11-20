// src/screens/MateriasScreen.js
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { obtenerMaterias } from "../api/materiasService";

export default function MateriasScreen({ navigation }) {
  const { token } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMaterias();
  }, []);

  const cargarMaterias = async () => {
    const res = await obtenerMaterias(token);

    if (res.ok) {
      setMaterias(res.materias);
    }

    setCargando(false);
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#374151" }}>
          Cargando materias...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
        <Ionicons name="home" size={40} color="green" />

      <Text style={styles.titulo}>Materias disponibles</Text>

      {materias.length === 0 ? (
        <Text style={styles.vacio}>
          No hay materias registradas por el administrador.
        </Text>
      ) : (
        <FlatList
          data={materias}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("Temas", {
                  materiaId: item.id,
                  nombreMateria: item.nombre,
                })
              }
            >
              <Text style={styles.nombre}>{item.nombre}</Text>

              {item.descripcion ? (
                <Text style={styles.descripcion}>{item.descripcion}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  descripcion: {
    marginTop: 6,
    color: "#475569",
  },
  vacio: {
    textAlign: "center",
    marginTop: 50,
    color: "#64748b",
    fontSize: 16,
  },
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
