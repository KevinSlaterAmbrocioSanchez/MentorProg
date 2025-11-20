// MentorProgApp/src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login, cargando } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const manejarLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Ingresa correo y contraseña.");
      return;
    }

    try {
      await login(email, password); // 👈 AQUÍ mandamos las credenciales
    } catch (error) {
      const mensajeServidor = error?.response?.data?.mensaje;
      Alert.alert(
        "Error",
        mensajeServidor ||
          "Error al iniciar sesión. Verifica tus credenciales o la conexión."
      );
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>MentorProg</Text>
      <Text style={styles.subtitulo}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#B0BEC5"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#B0BEC5"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.boton, cargando && { opacity: 0.7 }]}
        onPress={manejarLogin}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          {cargando ? "Ingresando..." : "Entrar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 18,
    color: "#E3F2FD",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  boton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  textoBoton: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
