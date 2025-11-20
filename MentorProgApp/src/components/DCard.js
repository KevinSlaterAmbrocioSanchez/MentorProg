// MentorProgApp/src/components/DCard.js
import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

/**
 * Tarjeta estilo Duolingo para listas (temas, subtemas, quizzes, etc.)
 *
 * Props:
 * - title: texto principal
 * - subtitle: texto secundario (opcional)
 * - iconName: nombre del ícono de Ionicons (opcional)
 * - color: color principal de la tarjeta (opcional)
 * - progressText: texto pequeño a la derecha (opcional, ej. "3/5", "Nuevo", etc.)
 * - onPress: función al pulsar la tarjeta
 */
export default function DCard({
  title,
  subtitle,
  iconName = "book-outline",
  color = "#58CC02",
  progressText,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardWrapper}
    >
      <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={28} color={color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {progressText ? (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{progressText}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FFF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  progressContainer: {
    marginLeft: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
});
