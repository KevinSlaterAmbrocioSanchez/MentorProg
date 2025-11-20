// frontend/src/pages/ResultadosQuiz.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MATERIAS_PATH = import.meta.env.VITE_MATERIAS_PATH || "materias";

function formatearFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function ResultadosQuiz() {
  const { materiaId, temaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const materiaNombre = location.state?.materiaNombre || materiaId;
  const temaTitulo = location.state?.temaTitulo || temaId;
  const subtemas = location.state?.subtemas || [];

  const [intentos, setIntentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroSubtemaId, setFiltroSubtemaId] = useState("");

  const token = localStorage.getItem("token");

  // Cargar intentos desde el backend
  useEffect(() => {
    const cargarIntentos = async () => {
      try {
        setCargando(true);
        setError("");

        const query = filtroSubtemaId
          ? `?subtemaId=${encodeURIComponent(filtroSubtemaId)}`
          : "";

        const res = await axios.get(
          `${API_URL}/${MATERIAS_PATH}/${materiaId}/temas/${temaId}/intentos${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data;
        setIntentos(Array.isArray(data?.intentos) ? data.intentos : []);
      } catch (err) {
        console.error(
          "❌ Error al cargar intentos de quiz:",
          err.response?.data || err.message
        );
        setError("No se pudieron cargar los resultados del quiz.");
        setIntentos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarIntentos();
  }, [materiaId, temaId, filtroSubtemaId, token]);

  const subtemasConQuiz = Array.isArray(subtemas)
    ? subtemas.filter((st) => st.mostrarQuiz)
    : [];

  return (
    <div
      style={{
        padding: "2rem 4rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Botón volver */}
      <button
        type="button"
        onClick={() =>
          // regresamos al listado de temas de la materia
          navigate(`/materias/${materiaId}/temas`, {
            state: { materiaNombre },
          })
        }
        style={{
          padding: "0.4rem 0.9rem",
          borderRadius: "999px",
          border: "none",
          background: "#1d4ed8",
          color: "white",
          fontSize: "0.85rem",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        ← Volver a temas de la materia
      </button>

      <section
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "1.75rem",
          boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                marginBottom: "0.25rem",
              }}
            >
              📊 Resultados de quizzes
            </h1>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#4b5563",
                marginBottom: "0.25rem",
              }}
            >
              Materia: <strong>{materiaNombre}</strong>
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
              }}
            >
              Tema: <strong>{temaTitulo}</strong> ({temaId})
            </p>
          </div>

          {/* Resumen rápido */}
          <div
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: "14px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              fontSize: "0.85rem",
              minWidth: "170px",
              textAlign: "right",
            }}
          >
            <div style={{ color: "#1d4ed8", fontWeight: 600 }}>
              {cargando
                ? "Cargando..."
                : `${intentos.length} intento(s) registrados`}
            </div>
            {!cargando && intentos.length > 0 && (
              <div style={{ color: "#4b5563", marginTop: 4 }}>
                Promedio:{" "}
                <strong>
                  {(
                    intentos.reduce(
                      (acc, it) => acc + (it.calificacion || 0),
                      0
                    ) / intentos.length
                  ).toFixed(1)}
                  %
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
            Filtrar por subtema:
          </div>

          <select
            value={filtroSubtemaId}
            onChange={(e) => setFiltroSubtemaId(e.target.value)}
            style={{
              minWidth: "220px",
              padding: "0.4rem 0.7rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              background: "#f9fafb",
            }}
          >
            <option value="">Todos los subtemas</option>
            {subtemasConQuiz.map((st) => (
              <option key={st.id} value={st.id}>
                {st.titulo || "(Subtema sin título)"}
              </option>
            ))}
          </select>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.6rem 0.9rem",
              borderRadius: "12px",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {cargando ? (
          <div style={{ padding: "1rem 0", fontSize: "0.9rem" }}>
            Cargando resultados del quiz...
          </div>
        ) : intentos.length === 0 ? (
          <div
            style={{
              padding: "1.2rem 0",
              fontSize: "0.9rem",
              color: "#6b7280",
            }}
          >
            Aún no hay intentos registrados para este tema
            {filtroSubtemaId && " y subtema"}.
          </div>
        ) : (
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.84rem",
              }}
            >
              <thead
                style={{
                  background: "#f3f4f6",
                  textAlign: "left",
                }}
              >
                <tr>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Estudiante</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Subtema</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Aciertos</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Calificación</th>
                  <th style={{ padding: "0.6rem 0.75rem" }}>Fecha y hora</th>
                </tr>
              </thead>
              <tbody>
                {intentos.map((it) => (
                  <tr
                    key={it.id}
                    style={{
                      borderTop: "1px solid #e5e7eb",
                      background: "white",
                    }}
                  >
                    {/* Estudiante */}
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 2,
                          color: "#111827",
                        }}
                      >
                        {it.userNombre || "Sin nombre"}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>
                        {it.userEmail || "Sin correo"}
                      </div>
                    </td>

                    {/* Subtema */}
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      {it.subtemaTitulo || "(Sin título)"}
                    </td>

                    {/* Aciertos */}
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      {it.aciertos ?? 0} / {it.totalPreguntas ?? 0}
                    </td>

                    {/* Calificación */}
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          background:
                            (it.calificacion || 0) >= 70
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            (it.calificacion || 0) >= 70
                              ? "#166534"
                              : "#b91c1c",
                          fontWeight: 600,
                        }}
                      >
                        {(it.calificacion || 0).toFixed(1)}%
                      </span>
                    </td>

                    {/* Fecha y hora */}
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      {formatearFecha(it.creadoEn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
