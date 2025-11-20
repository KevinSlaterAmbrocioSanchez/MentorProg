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

        console.log("💻 Respuesta /protected/dashboard:", res.data);
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
    admin: { color: "#0a1f44", bg: "#dbeafe", borde: "#2563eb" },
    docente: { color: "#14532d", bg: "#dcfce7", borde: "#16a34a" },
    alumno: { color: "#78350f", bg: "#fef3c7", borde: "#f59e0b" },
  };

  const estilo = estilosRol[usuario.rol] || estilosRol.alumno;

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: estilo.bg,
        color: estilo.color,
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          textAlign: "center",
          color: estilo.borde,
          fontWeight: "700",
          marginBottom: "2rem",
        }}
      >
        Panel MentorProg
      </h1>

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          borderLeft: `6px solid ${estilo.borde}`,
        }}
      >
        <p>
          <b>👤 Nombre:</b> {usuario.nombre}
        </p>
        <p>
          <b>📧 Email:</b> {usuario.email}
        </p>
        <p>
          <b>🎓 Rol:</b> {usuario.rol}
        </p>

        <hr style={{ margin: "1rem 0" }} />

        {/* ============================== */}
        {/* 📊 PANEL DEL ADMINISTRADOR */}
        {/* ============================== */}
        {usuario.rol === "admin" && datos && (
          <>
            <h2>📊 Resumen general del sistema</h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: "180px",
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: "1rem",
                }}
              >
                <b>Usuarios totales</b>
                <p style={{ fontSize: "1.6rem", margin: 0 }}>
                  {datos.totalUsuarios ?? 0}
                </p>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: "180px",
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: "1rem",
                }}
              >
                <b>Materias totales</b>
                <p style={{ fontSize: "1.6rem", margin: 0 }}>
                  {datos.totalMaterias ?? 0}
                </p>
              </div>
            </div>

            <h3>Usuarios por rol:</h3>
            <ul>
              {datos.conteoRoles &&
                Object.entries(datos.conteoRoles).map(([rol, cantidad]) => (
                  <li key={rol}>
                    {rol}: <b>{cantidad}</b>
                  </li>
                ))}
            </ul>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "1.5rem",
              }}
            >
              <button
                onClick={() => navigate("/usuarios")}
                style={{
                  padding: "0.8rem",
                  background: "#9333ea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                👥 Ir a Gestión de Usuarios
              </button>

              <button
                onClick={() => navigate("/materias")}
                style={{
                  padding: "0.8rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                📚 Ir a Gestión de Materias
              </button>

              <button
                onClick={() => navigate("/alumnos")}
                style={{
                  padding: "0.8rem",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                👨‍🎓 Ir a Gestión de Alumnos
              </button>

              <button
                onClick={() => navigate("/docentes")}
                style={{
                  padding: "0.8rem",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                👨‍🏫 Ir a Gestión de Docentes
              </button>
            </div>
          </>
        )}

        {/* Más adelante aquí pondremos vista para docente / usuario normal */}
      </div>
    </div>
  );
}

export default Dashboard;
 