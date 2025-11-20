// frontend/src/App.jsx
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Materias from "./pages/Materias.jsx";
import TemasMateria from "./pages/TemasMateria.jsx"; // 👈 NUEVO
import ResultadosQuiz from "./pages/ResultadosQuiz.jsx"; 
// ===============================
// 🔒 Wrapper de rutas protegidas
// ===============================
function Protected({ children }) {
  const { usuario, cargando } = useContext(AuthContext);
  const loc = useLocation();

  if (cargando) {
    return <div style={{ padding: 24 }}>Cargando sesión...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  return children;
}

// ===============================
// 🌐 App principal con navbar + rutas
// ===============================
export default function App() {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <div className="app-container">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="nav-link">
            🏠 Dashboard
          </Link>

          {usuario?.rol === "admin" && (
            <>
              <Link to="/usuarios" className="nav-link">
                👥 Usuarios
              </Link>
              <Link to="/materias" className="nav-link">
                📚 Materias
              </Link>
              {/* cuando tengas Subjects.jsx listo, descomentas: */}
              {/* <Link to="/subjects" className="nav-link">📘 Subjects</Link> */}
            </>
          )}
        </div>

        <div className="nav-right">
          {usuario ? (
            <>
              <span className="nav-user-label">
                👑 {usuario.rol === "admin" ? "Administrador" : "Usuario"}{" "}
                {usuario.nombre}
              </span>
              <button className="nav-link" onClick={logout}>
                🔒 Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              🔑 Login
            </Link>
          )}
        </div>
      </nav>

      {/* ================= CONTENIDO ================= */}
      <main className="app-main">
        <div className="app-content">
          <Routes>
            {/* PÚBLICA */}
            <Route path="/login" element={<Login />} />

            {/* PROTEGIDAS */}
            <Route
              path="/"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />

            <Route
              path="/usuarios"
              element={
                <Protected>
                  <Usuarios />
                </Protected>
              }
            />

            <Route
              path="/materias"
              element={
                <Protected>
                  <Materias />
                </Protected>
              }
            />

            {/* 🔹 Temas de una materia: /materias/:materiaId/temas */}
            <Route
              path="/materias/:materiaId/temas"
              element={
                <Protected>
                  <TemasMateria />
                </Protected>
              }
            />

            {/* 🔹 Resultados de quizzes de un tema */}
            <Route
              path="/materias/:materiaId/temas/:temaId/resultados"
              element={
                <Protected>
                  <ResultadosQuiz />
                </Protected>
              }
            />

            {/* RUTA 404 */}
            <Route
              path="*"
              element={
                <div style={{ padding: 24 }}>404 — Página no encontrada</div>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
