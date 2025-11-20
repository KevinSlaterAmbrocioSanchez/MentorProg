import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

function DocentePanel() {
  const { usuario } = useContext(AuthContext);
  const [tab, setTab] = useState("materias");
  const [materias, setMaterias] = useState([]);
  const [alumnosMateria, setAlumnosMateria] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [actividad, setActividad] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [actividades, setActividades] = useState([]);
  const [generando, setGenerando] = useState(false);

  const token = localStorage.getItem("token");
  const API_MATERIAS = "http://localhost:3000/materias";
  const API_ALUMNOS = "http://localhost:3000/alumnos";
  const API_GEMINI = "http://localhost:3000/ia/gemini";

  // === Cargar materias ===
  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        const res = await axios.get(`${API_MATERIAS}/mias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaterias(res.data.materias || []);
      } catch {
        Swal.fire("Error", "No se pudieron cargar tus materias.", "error");
      }
    };
    cargarMaterias();
  }, []);

  // === Cargar alumnos por materia ===
  const cargarAlumnos = async (idMateria) => {
    try {
      const res = await axios.get(`${API_ALUMNOS}/materia/${idMateria}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlumnosMateria((prev) => ({
        ...prev,
        [idMateria]: res.data.alumnos || [],
      }));
    } catch {
      Swal.fire("Error", "No se pudieron cargar los alumnos.", "error");
    }
  };

  // === Generar actividad con IA ===
const generarActividad = async () => {
  if (!materiaSeleccionada || !actividad.trim()) {
    Swal.fire("Campos incompletos", "Selecciona materia y describe la actividad.", "info");
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: "📅 Configurar fechas de la actividad",
    html:
      '<label>Fecha de inicio:</label><input id="fechaInicio" type="date" class="swal2-input">' +
      '<label>Fecha límite:</label><input id="fechaLimite" type="date" class="swal2-input">',
    focusConfirm: false,
    preConfirm: () => {
      return {
        inicio: document.getElementById("fechaInicio").value,
        limite: document.getElementById("fechaLimite").value,
      };
    },
  });

  if (!formValues.inicio || !formValues.limite) {
    Swal.fire("Fechas requeridas", "Debes ingresar ambas fechas.", "warning");
    return;
  }

  setGenerando(true);
  try {
    const res = await axios.post(
      API_GEMINI,
      { materia: materiaSeleccionada, descripcion: actividad },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const contenidoIA = res.data.actividad; // respuesta de Gemini

    // Mostrar vista previa
    const { isConfirmed } = await Swal.fire({
      icon: "info",
      title: "✨ Actividad generada con IA",
      html: `
        <p><b>Materia:</b> ${materiaSeleccionada}</p>
        <p><b>Descripción:</b> ${actividad}</p>
        <hr>
        <pre style="text-align:left;white-space:pre-line">${contenidoIA}</pre>
      `,
      showCancelButton: true,
      confirmButtonText: "✅ Aprobar y Publicar",
      cancelButtonText: "❌ Descartar",
    });

    if (isConfirmed) {
      await axios.post(
        "http://localhost:3000/actividades",
        {
          materiaId: materiaSeleccionada,
          descripcion: actividad,
          contenidoIA,
          fechaInicio: formValues.inicio,
          fechaLimite: formValues.limite,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("📚 Publicada", "La actividad fue enviada a los alumnos.", "success");
    } else {
      Swal.fire("Cancelado", "La actividad no fue publicada.", "info");
    }

    setActividad("");
  } catch (error) {
    Swal.fire("Error", "No se pudo generar o guardar la actividad.", "error");
  } finally {
    setGenerando(false);
  }
};


  // === Filtrar materias ===
  const materiasFiltradas = materias.filter((m) =>
    m.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{
      backgroundColor: "#f4f6fa",
      minHeight: "100vh",
      fontFamily: "Poppins, sans-serif",
      padding: "2rem"
    }}>
      {/* ===== CABECERA ===== */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "1.5rem",
        }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3106/3106885.png"
            alt="Docente"
            width="50"
            height="50"
          />
          <h1 style={{
            fontSize: "2rem",
            color: "#1b4332",
            fontWeight: "700",
            textAlign: "center",
          }}>
            Panel del Docente
          </h1>
        </div>

        {/* ===== BOTONES DE PESTAÑAS ===== */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
          <button
            onClick={() => setTab("materias")}
            style={{
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              background: tab === "materias"
                ? "linear-gradient(90deg, #2196F3, #64B5F6)"
                : "#e0e0e0",
              color: tab === "materias" ? "white" : "#333",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: tab === "materias" ? "0 3px 8px rgba(33,150,243,0.4)" : "none"
            }}
          >
            📘 Mis Materias
          </button>

          <button
            onClick={() => setTab("progreso")}
            style={{
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              background: tab === "progreso"
                ? "linear-gradient(90deg, #4CAF50, #81C784)"
                : "#e0e0e0",
              color: tab === "progreso" ? "white" : "#333",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: tab === "progreso" ? "0 3px 8px rgba(76,175,80,0.4)" : "none"
            }}
          >
            📊 Progreso y Actividades
          </button>
        </div>

        {/* ===== CONTENIDO DE PESTAÑAS ===== */}
        <div>
          {/* === TAB: MATERIAS === */}
          {tab === "materias" && (
            <div>
              <h2 style={{ color: "#1565C0", fontWeight: "600", marginBottom: "1rem" }}>
                📘 Mis Materias
              </h2>

              <input
                type="text"
                placeholder="Buscar materia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginBottom: "1.5rem",
                  color: "#faededff",
                }}
              />

              {materiasFiltradas.length > 0 ? (
                materiasFiltradas.map((m) => (
                  <div key={m.id} style={{
                    background: "#fafafa",
                    padding: "1.2rem",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    marginBottom: "1.5rem",
                    borderLeft: "5px solid #1976D2",
                  }}>
                    <h3 style={{ color: "#333", margin: 0 }}>
                      {m.nombre} <span style={{ color: "#666" }}>({m.codigo})</span>
                    </h3>
                    <p style={{ margin: "0.5rem 0", color: "#555" }}>
                      🧑‍🎓 <b>Alumnos:</b>
                    </p>

                    {alumnosMateria[m.id] ? (
                      alumnosMateria[m.id].length > 0 ? (
                        <ul style={{ color: "#333", marginLeft: "1rem" }}>
                          {alumnosMateria[m.id].map((a) => (
                            <li key={a.id}>{a.nombre} — {a.email}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: "#888" }}>No hay alumnos inscritos.</p>
                      )
                    ) : (
                      <button
                        onClick={() => cargarAlumnos(m.id)}
                        style={{
                          marginTop: "0.8rem",
                          background: "linear-gradient(90deg, #1565C0, #64B5F6)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.6rem 1.2rem",
                          cursor: "pointer",
                          fontWeight: "bold",
                          transition: "0.2s",
                        }}
                      >
                        👀 Ver Alumnos
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: "#777", textAlign: "center" }}>
                  No tienes materias asignadas.
                </p>
              )}
            </div>
          )}

          {/* === TAB: PROGRESO === */}
          {tab === "progreso" && (
            <div>
              <h2 style={{ color: "#2E7D32", fontWeight: "600", marginBottom: "1rem" }}>
                📊 Progreso y Actividades
              </h2>
              <p style={{ color: "#555", marginBottom: "1rem" }}>
                Genera ejercicios automáticos con Gemini según la materia seleccionada.
              </p>

              <select
                value={materiaSeleccionada}
                onChange={(e) => setMateriaSeleccionada(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginBottom: "1rem",
                  color: "#f8e7e7ff",
                }}
              >
                <option value="">Seleccionar materia...</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.nombre}>
                    {m.nombre}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Describe la actividad o tema..."
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
                style={{
                  width: "95%",
                  minHeight: "100px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  padding: "0.8rem",
                  color: "#f0e1e1ff",
                }}
              />

              <button
                onClick={generarActividad}
                disabled={generando}
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  padding: "0.9rem",
                  background: generando
                    ? "#90CAF9"
                    : "linear-gradient(90deg, #1E88E5, #42A5F5)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: generando ? "not-allowed" : "pointer",
                }}
              >
                {generando ? "⏳ Generando..." : "✨ Generar Actividad con IA"}
              </button>

              <hr style={{ margin: "2rem 0" }} />

              <h3 style={{ color: "#333" }}>🧾 Actividades Generadas</h3>
              {actividades.length > 0 ? (
                actividades.map((a, i) => (
                  <div key={i} style={{
                    background: "#f8f9fa",
                    borderLeft: "5px solid #4CAF50",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}>
                    <b>{a.titulo}</b>
                    <p>{a.descripcion}</p>
                    <p style={{ color: "#777" }}>Materia: {a.materia}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: "#777" }}>Aún no hay actividades generadas.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocentePanel;
