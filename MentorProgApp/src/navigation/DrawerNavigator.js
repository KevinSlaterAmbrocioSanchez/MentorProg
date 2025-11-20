// MentorProgApp/src/navigation/DrawerNavigator.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";

import MateriasScreen from "../screens/MateriasScreen";
import UserProgressScreen from "../screens/UserProgressScreen";
import PantallaDePerfil from "../screens/PantallaDePerfil";
import AjustesScreen from "../screens/AjustesScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#58CC02" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        drawerActiveTintColor: "#58CC02",
        drawerInactiveTintColor: "#4B5563",
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="Materias"
        component={MateriasScreen}
        options={{
          title: "Mis materias",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Mi Progreso"
        component={UserProgressScreen}
        options={{
          title: "Mi progreso",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Perfil"
        component={PantallaDePerfil}
        options={{
          title: "Mi perfil",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Ajustes"
        component={AjustesScreen}
        options={{
          title: "Ajustes",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
