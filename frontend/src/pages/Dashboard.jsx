import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // 👈 Para navegación interna

function Dashboard() {
  const { usuario } = useContext(AuthContext);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/protected/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDatos(res.data);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: "No se pudo obtener la información del panel.",
        });
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "3rem" }}>Cargando...</p>;

  const estilosRol = {
    admin: { color: "#0a1f44", bg: "#dbeafe", borde: "#2563eb" },
    docente: { color: "#14532d", bg: "#dcfce7", borde: "#16a34a" },
    alumno: { color: "#78350f", bg: "#fef3c7", borde: "#f59e0b" },
  };

  const estilo = estilosRol[usuario?.rol] || estilosRol.alumno;

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

      {usuario ? (
        <div
          style={{
            maxWidth: "600px",
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
          {usuario.rol === "admin" && datos ? (
            <>
              <h2>📊 Estadísticas del sistema</h2>
              <ul>
                <li><b>Total usuarios:</b> {datos.totalUsuarios}</li>
                <li><b>Total materias:</b> {datos.totalMaterias}</li>
              </ul>

              <h3>Distribución por roles:</h3>
              <ul>
                {Object.entries(datos.conteoRoles).map(([rol, cantidad]) => (
                  <li key={rol}>
                    {rol}: {cantidad}
                  </li>
                ))}
              </ul>

              {/* 🚀 BOTONES DE ADMINISTRADOR */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "1.5rem",
                }}
              >
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
              </div>
            </>
          ) : usuario.rol === "docente" && datos ? (
            <>
    <h2>📘 Materias Asignadas</h2>
    {datos.materias?.length ? (
      <ul>
        {datos.materias.map((m) => (
          <li key={m.id}>
            {m.nombre} ({m.codigo})
          </li>
        ))}
      </ul>
    ) : (
      <p>No tienes materias asignadas aún.</p>
    )}

    {/* 🚀 BOTONES DE FUNCIONALIDADES DEL DOCENTE */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "1.5rem",
      }}
    >
      <button
        onClick={() => navigate("/docente")}
        style={{
          padding: "0.8rem",
          background: "#0d6efd",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "1rem",
        }}
      >
        📘 Ir a Mis Materias
      </button>

      <button
        onClick={() => navigate("/docente")}
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
        📊 Ver Progreso Académico
      </button>
    </div>
  </>
          ) : usuario.rol === "alumno" && datos ? (
            <>
              <h2>🎯 Progreso del alumno</h2>
              {datos.progreso?.map((p, i) => (
                <p key={i}>
                  {p.materia}: <b>{p.avance}%</b>
                </p>
              ))}
              <p style={{ marginTop: "1rem" }}>
                💬 {datos.retroalimentacion}
              </p>
            </>
          ) : null}

          {/* 🔒 BOTÓN DE CERRAR SESIÓN */}
          <button
            onClick={cerrarSesion}
            style={{
              marginTop: "2rem",
              padding: "0.7rem 1.5rem",
              background: estilo.borde,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            🔒 Cerrar sesión
          </button>
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>
          No se pudo cargar la información del usuario.
        </p>
      )}
    </div>
  );
}

export default Dashboard;
