// ===============================
// 🚀 MentorProg - App.jsx
// ===============================
import React from "react";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext"; // 👈 Envuelve toda la app con el contexto

function App() {
  return (
    // El AuthProvider se encarga de mantener al usuario autenticado
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
