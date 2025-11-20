// MentorProgApp/src/navigation/RootNavigator.js
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

// Screens
import LoginScreen from "../screens/LoginScreen";
import DrawerNavigator from "./DrawerNavigator";
import TemasScreen from "../screens/TemasScreen";
import SubtemasScreen from "../screens/SubtemasScreen";
import QuizzesScreen from "../screens/QuizzesScreen";
import ResolverQuizScreen from "../screens/ResolverQuizScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { cargando, token } = useAuth();
  const estaAutenticado = !!token;

  if (cargando) {
    // Pantalla simple de carga mientras revisamos AsyncStorage
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F6F6F6",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#58CC02" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {!estaAutenticado ? (
          // 🔐 Stack de autenticación
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // 🌱 Stack principal de la app
          <>
            {/* Drawer con Materias y Mi Progreso */}
            <Stack.Screen
              name="Main"
              component={DrawerNavigator}
              options={{ headerShown: false }}
            />

            {/* Pantallas que cuelgan de Materias */}
            <Stack.Screen
              name="Temas"
              component={TemasScreen}
              options={({ route }) => ({
                title: route.params?.nombreMateria
                  ? `Temas de ${route.params.nombreMateria}`
                  : "Temas",
              })}
            />

            <Stack.Screen
              name="Subtemas"
              component={SubtemasScreen}
              options={({ route }) => ({
                title: route.params?.tema?.titulo || "Subtemas",
              })}
            />

            <Stack.Screen
              name="Quizzes"
              component={QuizzesScreen}
              options={{
                title: "Quizzes",
              }}
            />

            <Stack.Screen
              name="ResolverQuiz"
              component={ResolverQuizScreen}
              options={{
                title: "Resolver quiz",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
