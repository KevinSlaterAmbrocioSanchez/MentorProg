// src/screens/PantallaDePerfil.js
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function PantallaDePerfil() {
  const { usuario, logout } = useAuth();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f0f4ff" }}>
      <View
        style={{
          alignItems: "center",
          marginTop: 40,
          marginBottom: 30,
        }}
      >
        <Image
          source={{
            uri:
              usuario?.foto ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 15,
            borderWidth: 3,
            borderColor: "#1e3a8a",
          }}
        />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1e3a8a" }}>
          {usuario?.nombre || "Usuario"}
        </Text>
        <Text style={{ color: "#374151", marginTop: 4 }}>
          {usuario?.email}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontStyle: "italic",
            color: "#6b7280",
            backgroundColor: "#e0e7ff",
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          Rol: {usuario?.rol}
        </Text>
      </View>

      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: "#dc2626",
          padding: 15,
          borderRadius: 12,
          marginTop: 20,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
