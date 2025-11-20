// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { usuario, cargando } = useContext(AuthContext);
  const [datos, setDatos] = useState(null);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3000/protected/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDatos(res.data);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: "No se pudo obtener la información del panel.",
        });
      } finally {
        setLoadingDatos(false);
      }
    };

    obtenerDatos();
  }, []);

  if (cargando || loadingDatos) {
    return (
      <p style={{ textAlign: "center", marginTop: "3rem" }}>Cargando...</p>
    );
  }

  if (!usuario) {
    return (
      <p style={{ textAlign: "center", marginTop: "3rem" }}>
        No se pudo cargar la sesión.
      </p>
    );
  }

  const estilosRol = {
    admin: { color: "#0f172a", bg: "#e5edff", borde: "#2563eb" },
    docente: { color: "#14532d", bg: "#dcfce7", borde: "#16a34a" },
    alumno: { color: "#78350f", bg: "#fef3c7", borde: "#f59e0b" },
  };

  const estilo = estilosRol[usuario.rol] || estilosRol.admin;

  return (
    <div
      style={{
        padding: "2rem 3rem",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ENCABEZADO */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 1.5rem auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            Panel MentorProg
          </h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Bienvenido, {usuario.nombre} — rol: <b>{usuario.rol}</b>
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr",
          gap: "1.5rem",
        }}
      >
        {/* TARJETA DE ESTADÍSTICAS */}
        <section
          style={{
            background: "white",
            borderRadius: 16,
            padding: "1.5rem 1.8rem",
            boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
            borderTop: `5px solid ${estilo.borde}`,
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>📊</span> Estadísticas del sistema
          </h2>

          {/* KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "1rem",
              marginBottom: "1.2rem",
            }}
          >
            <div
              style={{
                background: "#eff6ff",
                borderRadius: 12,
                padding: "0.9rem 1rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "#6b7280",
                }}
              >
                Usuarios totales
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.7rem",
                  fontWeight: "700",
                  color: "#1d4ed8",
                }}
              >
                {datos?.totalUsuarios ?? 0}
              </p>
            </div>
            <div
              style={{
                background: "#ecfdf3",
                borderRadius: 12,
                padding: "0.9rem 1rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "#6b7280",
                }}
              >
                Materias / Subjects
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.7rem",
                  fontWeight: "700",
                  color: "#15803d",
                }}
              >
                {datos?.totalMaterias ?? 0}
              </p>
            </div>
          </div>

          {/* DISTRIBUCIÓN POR ROL */}
          {datos?.conteoRoles && (
            <>
              <h3
                style={{
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Usuarios por rol
              </h3>
              <ul style={{ marginTop: 0, paddingLeft: "1.3rem" }}>
                {Object.entries(datos.conteoRoles).map(([rol, cantidad]) => (
                  <li key={rol} style={{ fontSize: "0.9rem" }}>
                    {rol}: <b>{cantidad}</b>
                  </li>
                ))}
              </ul>
              <p
                style={{
                  marginTop: "0.8rem",
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                }}
              >
                Última actualización:{" "}
                {new Date(datos.ultimaActualizacion).toLocaleString()}
              </p>
            </>
          )}
        </section>

        {/* ACCIONES RÁPIDAS DEL ADMIN */}
        {usuario.rol === "admin" && (
          <section
            style={{
              background: "white",
              borderRadius: 16,
              padding: "1.5rem 1.8rem",
              boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⚙️ Acciones del administrador
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.7rem",
              }}
            >
              <button
                onClick={() => navigate("/usuarios")}
                style={{
                  padding: "0.9rem 1rem",
                  borderRadius: 10,
                  border: "none",
                  background:
                    "linear-gradient(90deg, #7c3aed, #a855f7)",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                👥 Gestionar usuarios
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    opacity: 0.9,
                  }}
                >
                  Crear cuentas, asignar rol admin/usuario.
                </div>
              </button>

              <button
                onClick={() => navigate("/materias")}
                style={{
                  padding: "0.9rem 1rem",
                  borderRadius: 10,
                  border: "none",
                  background:
                    "linear-gradient(90deg, #2563eb, #1d4ed8)",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                📚 Gestionar materias / subjects
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    opacity: 0.9,
                  }}
                >
                  Crear materias, luego temas y quizzes con Gemini.
                </div>
              </button>

              {/* Este lo usaremos después para el diseño duolingo */}
              <button
                disabled
                style={{
                  padding: "0.9rem 1rem",
                  borderRadius: 10,
                  border: "1px dashed #c4b5fd",
                  background: "#faf5ff",
                  color: "#4c1d95",
                  fontWeight: "600",
                  textAlign: "left",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
              >
                🧪 Diseñar ruta tipo Duolingo
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    opacity: 0.9,
                  }}
                >
                  Próximamente: mapa de temas / subtemas y progreso visual.
                </div>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
