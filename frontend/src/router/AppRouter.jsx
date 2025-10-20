// ===============================
// 🧭 AppRouter - Sistema de rutas principal
// ===============================
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import SignUp from "../components/SignUp";
import Dashboard from "../pages/Dashboard";
import Materias from "../pages/Materias";
import Docentes from "../pages/Docentes";   // 👨‍🏫 NUEVO
import Usuarios from "../pages/Usuarios";   // 👥 NUEVO
import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "../context/AuthContext";
import DocentePanel from "../pages/DocentePanel";
function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Página principal (login) */}
          <Route path="/" element={<Login />} />

          {/* Registro de nuevos usuarios */}
          <Route path="/signup" element={<SignUp />} />

          {/* Dashboard protegido */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
            <Route
  path="/docente"
  element={
    <PrivateRoute>
      <DocentePanel />
    </PrivateRoute>
  }
/>
          {/* Gestión de materias protegida */}
          <Route
            path="/materias"
            element={
              <PrivateRoute>
                <Materias />
              </PrivateRoute>
            }
          />

          {/* 👨‍🏫 Gestión de docentes protegida */}
          <Route
            path="/docentes"
            element={
              <PrivateRoute>
                <Docentes />
              </PrivateRoute>
            }
          />
            
          {/* 👥 Gestión de usuarios protegida */}
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <Usuarios />
              </PrivateRoute>
            }
          />

          {/* Redirección por defecto (404 → login) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
