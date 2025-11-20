// frontend/src/pages/Materias.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// 🔹 Base del backend (usa .env o 3000 por defecto)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Materias() {
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [formulario, setFormulario] = useState({
    nombre: "",
    clave: "",
    carrera: "Ingeniería en Sistemas Computacionales",
    creditos: "",
    teoria: "",
    practica: "",
    descripcion: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // 👈 para ir a /materias/:materiaId/temas

  // ==========================
  // 🔹 Cargar subjects del backend
  // ==========================
  const cargarMaterias = async () => {
    try {
      const res = await axios.get(`${API_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🔎 /subjects respondió:", res.data);

      const datos = res.data;

      // Normalizamos a arreglo
      if (Array.isArray(datos)) {
        setMaterias(datos);
      } else if (Array.isArray(datos.subjects)) {
        setMaterias(datos.subjects);
      } else {
        setMaterias([]);
      }
    } catch (error) {
      console.error(
        "❌ Error al cargar materias:",
        error.response?.data || error
      );
      Swal.fire(
        "Error",
        "No se pudieron cargar las materias / subjects",
        "error"
      );
      setMaterias([]); // para que no se quede undefined
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMaterias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  // 🔹 Manejo de inputs
  // ==========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================
  // 🔹 Crear nueva materia
  // ==========================
  const handleCrearMateria = async (e) => {
    e.preventDefault();

    if (!formulario.nombre || !formulario.clave) {
      return Swal.fire(
        "Campos requeridos",
        "Nombre y clave de la materia son obligatorios",
        "warning"
      );
    }

    try {
      const payload = {
        id: formulario.clave.trim(), // 👈 usaremos la clave como ID en Firestore
        nombre: formulario.nombre.trim(),
        carrera: formulario.carrera.trim(),
        satca: {
          creditos: Number(formulario.creditos) || 0,
          teoria: Number(formulario.teoria) || 0,
          practica: Number(formulario.practica) || 0,
        },
        descripcion: formulario.descripcion.trim(),
      };

      const res = await axios.post(`${API_URL}/subjects`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Subject creado:", res.data);

      Swal.fire("Éxito", "Materia creada correctamente", "success");
      setFormulario({
        nombre: "",
        clave: "",
        carrera: "Ingeniería en Sistemas Computacionales",
        creditos: "",
        teoria: "",
        practica: "",
        descripcion: "",
      });

      cargarMaterias();
    } catch (error) {
      console.error(
        "❌ Error al crear materia:",
        error.response?.data || error
      );
      Swal.fire(
        "Error",
        error.response?.data?.mensaje || "No se pudo crear la materia",
        "error"
      );
    }
  };

  // ==========================
  // 🔹 UI
  // ==========================
  if (cargando) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Cargando materias...
      </div>
    );
  }

  const materiasLista = Array.isArray(materias) ? materias : [];

  return (
    <div
      style={{
        padding: "2rem 4rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        📘 Gestión de Materias / Subjects
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Administra las asignaturas base del sistema. Más adelante, desde cada
        materia podrás definir temas, subtemas y generar quizzes con Gemini.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* ==================== FORMULARIO ==================== */}
        <section
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "1.75rem",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Crear nueva materia
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              marginBottom: 16,
            }}
          >
            Registra la información básica y los créditos SATCA de la
            asignatura.
          </p>

          <form onSubmit={handleCrearMateria}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label className="label-form">Nombre de la materia</label>
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                className="input-form"
                placeholder="Administración de redes"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <label className="label-form">Clave</label>
                <input
                  type="text"
                  name="clave"
                  value={formulario.clave}
                  onChange={handleChange}
                  className="input-form"
                  placeholder="SCA-1002"
                />
              </div>

              <div>
                <label className="label-form">Carrera</label>
                <input
                  type="text"
                  name="carrera"
                  value={formulario.carrera}
                  onChange={handleChange}
                  className="input-form"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <label className="label-form">SATCA créditos</label>
                <input
                  type="number"
                  min="0"
                  name="creditos"
                  value={formulario.creditos}
                  onChange={handleChange}
                  className="input-form"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="label-form">Teoría</label>
                <input
                  type="number"
                  min="0"
                  name="teoria"
                  value={formulario.teoria}
                  onChange={handleChange}
                  className="input-form"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="label-form">Práctica</label>
                <input
                  type="number"
                  min="0"
                  name="practica"
                  value={formulario.practica}
                  onChange={handleChange}
                  className="input-form"
                  placeholder="3"
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label className="label-form">
                Descripción / presentación (opcional)
              </label>
              <textarea
                name="descripcion"
                rows={3}
                value={formulario.descripcion}
                onChange={handleChange}
                className="input-form"
                placeholder="Breve descripción de qué trata la materia..."
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "999px",
                border: "none",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              ➕ Crear materia
            </button>
          </form>
        </section>

        {/* ==================== LISTA ==================== */}
        <section
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "1.75rem",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Materias registradas
          </h2>

          {materiasLista.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
              Aún no hay materias registradas. Crea la primera con el
              formulario de la izquierda.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {materiasLista.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "14px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.98rem",
                          marginBottom: 2,
                        }}
                      >
                        {m.nombre}{" "}
                        <span
                          style={{
                            color: "#6b7280",
                            fontWeight: 400,
                          }}
                        >
                          ({m.id})
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                          marginBottom: 2,
                        }}
                      >
                        {m.carrera}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                        }}
                      >
                        SATCA: {m.satca?.creditos ?? 0} cr — T
                        {m.satca?.teoria ?? 0} / P{m.satca?.practica ?? 0}
                      </div>
                    </div>

                    {/* Botones de acciones por materia */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {/* 👉 Abre la vista de TemasMateria */}
                      <button
                        type="button"
                        style={{
                          padding: "0.35rem 0.7rem",
                          fontSize: "0.8rem",
                          borderRadius: "999px",
                          border: "none",
                          background: "#2563eb",
                          color: "white",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(`/materias/${m.id}/temas`, {
                            state: {
                              materiaNombre: m.nombre,
                              materia: m, // por si lo quieres usar completo
                            },
                          })
                        }
                      >
                        Temas / subtemas
                      </button>

                      {/* Quizzes (placeholder) */}
                      <button
                        type="button"
                        style={{
                          padding: "0.35rem 0.7rem",
                          fontSize: "0.8rem",
                          borderRadius: "999px",
                          border: "1px dashed #9ca3af",
                          background: "white",
                          color: "#4b5563",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          Swal.fire(
                            "Quizzes de la materia",
                            `Luego podrás ver/generar quizzes para ${m.nombre}`,
                            "info"
                          )
                        }
                      >
                        Quizzes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Materias;
