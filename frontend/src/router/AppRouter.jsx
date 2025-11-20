// frontend/src/router/AppRouter.jsx
// ===============================
// 🧭 AppRouter - Sistema de rutas principal
// ===============================
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../components/Login";
import SignUp from "../components/SignUp";

import Dashboard from "../pages/Dashboard";
import Materias from "../pages/Materias.jsx";
import Docentes from "../pages/Docentes";
import Usuarios from "../pages/Usuarios";
import DocentePanel from "../pages/DocentePanel";
import TemasMateria from "../pages/TemasMateria.jsx";

import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "../context/AuthContext";

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

          {/* Panel de docente */}
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

          {/* 🔹 Temas de una materia (NUEVO) */}
          <Route
            path="/materias/:materiaId/temas"
            element={
              <PrivateRoute>
                <TemasMateria />
              </PrivateRoute>
            }
          />

          {/* Gestión de docentes protegida */}
          <Route
            path="/docentes"
            element={
              <PrivateRoute>
                <Docentes />
              </PrivateRoute>
            }
          />

          {/* Gestión de usuarios protegida */}
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <Usuarios />
              </PrivateRoute>
            }
          />

          {/* Cualquier ruta desconocida → Dashboard (o al login si prefieres) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
