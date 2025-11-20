// MentorProgApp/src/screens/UserProgressScreen.js
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
import apiClient from "../api/apiClient";

export default function UserProgressScreen() {
  const { token, usuario } = useAuth();
  const [progreso, setProgreso] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarProgreso = async () => {
    try {
      setCargando(true);
      const res = await apiClient.get("/progreso", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || {};
      const lista = Array.isArray(data.progreso) ? data.progreso : [];
      setProgreso(lista);
    } catch (error) {
      console.error("❌ Error al obtener progreso:", error?.response?.data || error.message);
      setProgreso([]);
    } finally {
      setCargando(false);
    }
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cargarProgreso();
    setRefrescando(false);
  };

  useEffect(() => {
    cargarProgreso();
  }, []);

  const formatearFecha = (iso) => {
    if (!iso) return "";
    // formato simple: dd/mm/aaaa hh:mm
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
  };

  const obtenerMedalla = (porcentaje) => {
    if (porcentaje >= 90) return "🥇";
    if (porcentaje >= 75) return "🥈";
    if (porcentaje >= 60) return "🥉";
    return "📘";
  };

  const obtenerMensaje = (porcentaje) => {
    if (porcentaje >= 90) return "¡Increíble! Mantén ese nivel 💪";
    if (porcentaje >= 75) return "Muy bien, sigue practicando ✨";
    if (porcentaje >= 60) return "Vas bien, pero puedes mejorar 🚀";
    return "Es un buen inicio, ¡no te rindas! 🌱";
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
      <View
        style={{
          marginBottom: 18,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#DCFCE7",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="stats-chart" size={26} color="#16A34A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#273B1B",
              marginBottom: 2,
            }}
          >
            Mi progreso
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>
            {usuario?.nombre || usuario?.email || "Usuario"}
          </Text>
        </View>
      </View>

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
            Cargando tu historial...
          </Text>
        </View>
      ) : progreso.length === 0 ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#6B7280", fontSize: 16 }}>
            Aún no tienes quizzes resueltos.
          </Text>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 14,
              marginTop: 6,
              fontStyle: "italic",
            }}
          >
            Cuando empieces a contestar quizzes, tu avance aparecerá aquí.
          </Text>
        </View>
      ) : (
        progreso.map((item) => {
          const porcentaje = item.porcentaje ?? 0;
          const medalla = obtenerMedalla(porcentaje);
          const mensaje = obtenerMensaje(porcentaje);

          return (
            <View
              key={item.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                padding: 14,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 24, marginRight: 8 }}>{medalla}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Quiz: {item.quizId || "Sin ID"}
                  </Text>
                  {item.subtemaTitulo && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                      }}
                    >
                      Subtema: {item.subtemaTitulo}
                    </Text>
                  )}
                  {item.materiaId && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                      }}
                    >
                      Materia: {item.materiaId}
                    </Text>
                  )}
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 4,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: "#166534", fontWeight: "600" }}>
                  {item.correctas} / {item.total} correctas
                </Text>
                <Text style={{ color: "#166534", fontWeight: "700" }}>
                  {porcentaje}%
                </Text>
              </View>

              {/* Barra de progreso simple tipo Duolingo */}
              <View
                style={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#E5E7EB",
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    width: `${Math.min(Math.max(porcentaje, 0), 100)}%`,
                    height: "100%",
                    backgroundColor: "#22C55E",
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  marginBottom: 4,
                }}
              >
                {mensaje}
              </Text>

              {item.fecha && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginTop: 2,
                  }}
                >
                  {formatearFecha(item.fecha)}
                </Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
