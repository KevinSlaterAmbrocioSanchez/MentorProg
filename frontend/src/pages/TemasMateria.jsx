// frontend/src/pages/TemasMateria.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MATERIAS_PATH = import.meta.env.VITE_MATERIAS_PATH || "materias";

// Helpers para crear estructuras vacías
const crearOpcionVacia = (esCorrecta = false) => ({
  id: Date.now().toString() + Math.random(),
  texto: "",
  esCorrecta,
});

const crearPreguntaVacia = () => ({
  id: Date.now().toString() + Math.random(),
  enunciado: "",
  opciones: [crearOpcionVacia(true), crearOpcionVacia(false)], // 2 opciones mínimas
});

const crearSubtemaVacio = () => ({
  id: Date.now().toString() + Math.random(),
  titulo: "",
  mostrarInfo: true,
  mostrarQuiz: false,
  contenido: "",
  preguntas: [],
});

// Normaliza un tema que viene del backend a la estructura del formulario
const normalizarTema = (temaBackend) => {
  const subtemasNorm = (temaBackend.subtemas || []).map((st) => ({
    id: st.id || Date.now().toString() + Math.random(),
    titulo: st.titulo || "",
    mostrarInfo:
      typeof st.mostrarInfo === "boolean" ? st.mostrarInfo : true,
    mostrarQuiz:
      typeof st.mostrarQuiz === "boolean" ? st.mostrarQuiz : false,
    contenido: st.contenido || "",
    preguntas: (st.preguntas || []).map((p) => ({
      id: p.id || Date.now().toString() + Math.random(),
      enunciado: p.enunciado || "",
      opciones:
        (p.opciones && p.opciones.length > 0
          ? p.opciones
          : [crearOpcionVacia(true), crearOpcionVacia(false)]
        ).map((op, idx) => ({
          id: op.id || Date.now().toString() + Math.random(),
          texto: op.texto || "",
          esCorrecta:
            typeof op.esCorrecta === "boolean"
              ? op.esCorrecta
              : idx === 0,
        })),
    })),
  }));

  return {
    id: temaBackend.id,
    titulo: temaBackend.titulo || "",
    descripcion: temaBackend.descripcion || "",
    subtemas: subtemasNorm.length ? subtemasNorm : [crearSubtemaVacio()],
  };
};

export default function TemasMateria() {
  const { materiaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const materiaNombre = location.state?.materiaNombre || materiaId;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [hayCambiosSinGuardar, setHayCambiosSinGuardar] = useState(false);
  const marcarCambios = () => setHayCambiosSinGuardar(true);

  // Lista de temas en la barra lateral
  const [temasLista, setTemasLista] = useState([]);
  // Id del tema actualmente seleccionado (null = tema nuevo sin guardar)
  const [temaActualId, setTemaActualId] = useState(null);

  // Datos del tema que se está editando
  const [tema, setTema] = useState({
    titulo: "",
    descripcion: "",
    subtemas: [crearSubtemaVacio()],
  });

  const token = localStorage.getItem("token");

  // ==========================
  // Cargar temas desde backend
  // ==========================
  useEffect(() => {
    const cargarTemas = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/${MATERIAS_PATH}/${materiaId}/temas`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const temasBackend = res.data?.temas || [];

        setTemasLista(temasBackend);

        if (temasBackend.length > 0) {
          // Seleccionamos el primero
          const primero = temasBackend[0];
          setTemaActualId(primero.id);
          setTema(normalizarTema(primero));
        } else {
          // No hay temas aún
          setTemaActualId(null);
          setTema({
            titulo: "",
            descripcion: "",
            subtemas: [crearSubtemaVacio()],
          });
        }
      } catch (error) {
        console.warn(
          "No se pudieron cargar los temas, se inicia con uno vacío:",
          error.response?.data || error.message
        );
        setTemasLista([]);
        setTemaActualId(null);
        setTema({
          titulo: "",
          descripcion: "",
          subtemas: [crearSubtemaVacio()],
        });
      } finally {
        setCargando(false);
      }
    };

    cargarTemas();
  }, [materiaId, token]);

  // ==========================
  // Seleccionar tema de la lista
  // ==========================
  const manejarSeleccionTema = (temaSeleccionado) => {
    setTemaActualId(temaSeleccionado.id);
    setTema(normalizarTema(temaSeleccionado));
  };

  // Crear un tema nuevo vacío (sin guardar aún)
  const manejarNuevoTema = () => {
    setTemaActualId(null);
    setTema({
      titulo: "",
      descripcion: "",
      subtemas: [crearSubtemaVacio()],
    });
  };

  // ==========================
  // Handlers del tema actual
  // ==========================
  const handleChangeTema = (field, value) => {
    setTema((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgregarSubtema = () => {
    setTema((prev) => ({
      ...prev,
      subtemas: [...prev.subtemas, crearSubtemaVacio()],
    }));
  };

  const handleEliminarSubtema = (indexSubtema) => {
    if (
      !window.confirm(
        "¿Seguro que quieres eliminar este subtema? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      subtemas.splice(indexSubtema, 1);
      // Siempre dejamos al menos 1 subtema vacío para no dejar el formulario en blanco total
      return {
        ...prev,
        subtemas: subtemas.length ? subtemas : [crearSubtemaVacio()],
      };
    });

    setHayCambiosSinGuardar(true); // o marcarCambios();
  };

  const handleChangeSubtemaCampo = (index, field, value) => {
    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      subtemas[index] = { ...subtemas[index], [field]: value };
      return { ...prev, subtemas };
    });
  };

  const handleToggleInfo = (index, checked) => {
    handleChangeSubtemaCampo(index, "mostrarInfo", checked);
  };

  const handleToggleQuiz = (index, checked) => {
    handleChangeSubtemaCampo(index, "mostrarQuiz", checked);
  };

  // ==========================
  // Quiz: preguntas y opciones
  // ==========================
  const handleAgregarPregunta = (indexSubtema) => {
    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      const st = { ...subtemas[indexSubtema] };
      const preguntas = st.preguntas ? [...st.preguntas] : [];
      preguntas.push(crearPreguntaVacia());
      st.preguntas = preguntas;
      subtemas[indexSubtema] = st;
      return { ...prev, subtemas };
    });
  };

  const handleEliminarPregunta = (indexSubtema, indexPregunta) => {
    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      const st = { ...subtemas[indexSubtema] };
      const preguntas = [...(st.preguntas || [])];
      preguntas.splice(indexPregunta, 1);
      st.preguntas = preguntas;
      subtemas[indexSubtema] = st;
      return { ...prev, subtemas };
    });

    // 🔔 Marca que hay cambios pendientes
    setHayCambiosSinGuardar(true); // o marcarCambios();
  };

  const handleCambioEnunciado = (indexSubtema, indexPregunta, valor) => {
    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      const st = { ...subtemas[indexSubtema] };
      const preguntas = [...(st.preguntas || [])];
      const preg = { ...preguntas[indexPregunta], enunciado: valor };
      preguntas[indexPregunta] = preg;
      st.preguntas = preguntas;
      subtemas[indexSubtema] = st;
      return { ...prev, subtemas };
    });
  };

  const handleAgregarOpcion = (indexSubtema, indexPregunta) => {
    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      const st = { ...subtemas[indexSubtema] };
      const preguntas = [...(st.preguntas || [])];
      const preg = { ...preguntas[indexPregunta] };
      const opciones = [...(preg.opciones || [])];

      if (opciones.length >= 4) return prev; // máximo 4

      opciones.push(crearOpcionVacia(false));
      preg.opciones = opciones;
      preguntas[indexPregunta] = preg;
      st.preguntas = preguntas;
      subtemas[indexSubtema] = st;
      return { ...prev, subtemas };
    });
  };

  const handleCambioTextoOpcion = (
    indexSubtema,
    indexPregunta,
    indexOpcion,
    valor
  ) => {
    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      const st = { ...subtemas[indexSubtema] };
      const preguntas = [...(st.preguntas || [])];
      const preg = { ...preguntas[indexPregunta] };
      const opciones = [...(preg.opciones || [])];
      const op = { ...opciones[indexOpcion], texto: valor };
      opciones[indexOpcion] = op;
      preg.opciones = opciones;
      preguntas[indexPregunta] = preg;
      st.preguntas = preguntas;
      subtemas[indexSubtema] = st;
      return { ...prev, subtemas };
    });
  };

  const handleMarcarCorrecta = (
    indexSubtema,
    indexPregunta,
    indexOpcionCorrecta
  ) => {
    setTema((prev) => {
      const subtemas = [...prev.subtemas];
      const st = { ...subtemas[indexSubtema] };
      const preguntas = [...(st.preguntas || [])];
      const preg = { ...preguntas[indexPregunta] };
      const opciones = [...(preg.opciones || [])];

      const nuevasOpciones = opciones.map((op, idx) => ({
        ...op,
        esCorrecta: idx === indexOpcionCorrecta,
      }));

      preg.opciones = nuevasOpciones;
      preguntas[indexPregunta] = preg;
      st.preguntas = preguntas;
      subtemas[indexSubtema] = st;
      return { ...prev, subtemas };
    });
  };

  // ==========================
  // IA: Generar contenido (DESACTIVADO)
  // ==========================
  const handleGenerarContenidoIA = async () => {
    alert(
      "La función de 'Generar con IA' está desactivada por ahora.\n\n" +
        "Puedes escribir el contenido del subtema manualmente. Más adelante la conectaremos de nuevo."
    );
  };

  // ==========================
  // Guardar / eliminar tema completo
  // ==========================
  const handleGuardarTema = async () => {
    try {
      if (!tema.titulo.trim()) {
        alert("El título del tema es obligatorio.");
        return;
      }

      setGuardando(true);

      const payload = {
        titulo: tema.titulo.trim(),
        descripcion: tema.descripcion.trim(),
        subtemas: tema.subtemas.map((st) => ({
          ...st,
          titulo: st.titulo.trim(),
          contenido: st.contenido.trim(),
          preguntas: (st.preguntas || []).map((p) => ({
            ...p,
            enunciado: p.enunciado.trim(),
            opciones: (p.opciones || []).map((op) => ({
              ...op,
              texto: op.texto.trim(),
            })),
          })),
        })),
      };

      if (temaActualId) {
        // Actualizar tema existente (PUT)
        await axios.put(
          `${API_URL}/${MATERIAS_PATH}/${materiaId}/temas/${temaActualId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setHayCambiosSinGuardar(false);

        // Actualizamos la lista local
        setTemasLista((prev) =>
          prev.map((t) =>
            t.id === temaActualId ? { ...t, ...payload } : t
          )
        );

        alert("✅ Tema actualizado correctamente.");
      } else {
        // Crear nuevo tema (POST)
        const res = await axios.post(
          `${API_URL}/${MATERIAS_PATH}/${materiaId}/temas`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const temaCreado = res.data?.tema;
        if (temaCreado) {
          setTemasLista((prev) => [...prev, temaCreado]);
          setTemaActualId(temaCreado.id);
          setTema(normalizarTema(temaCreado));
        }

        alert("✅ Tema creado correctamente con sus subtemas y quiz.");
      }
    } catch (error) {
      console.error(
        "Error al guardar tema:",
        error.response?.data || error.message
      );
      alert(
        "❌ Error al guardar el tema. Revisa la consola para más detalles."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarTemaActual = async () => {
    if (!temaActualId) {
      // Tema todavía no existe en BD, solo limpiamos el formulario
      if (
        window.confirm(
          "Este tema aún no está guardado en la base de datos. ¿Quieres limpiar el formulario?"
        )
      ) {
        manejarNuevoTema();
      }
      return;
    }

    const confirmado = window.confirm(
      "¿Seguro que quieres eliminar este tema y todos sus subtemas y preguntas?\n\nEsta acción NO se puede deshacer."
    );
    if (!confirmado) return;

    try {
      await axios.delete(
        `${API_URL}/${MATERIAS_PATH}/${materiaId}/temas/${temaActualId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Quitamos el tema de la lista local
      setTemasLista((prev) => prev.filter((t) => t.id !== temaActualId));

      // Seleccionamos otro tema (si queda alguno), o limpiamos
      setTemasLista((prevDespues) => {
        if (prevDespues.length > 0) {
          const nuevo = prevDespues[0];
          setTemaActualId(nuevo.id);
          setTema(normalizarTema(nuevo));
        } else {
          setTemaActualId(null);
          setTema({
            titulo: "",
            descripcion: "",
            subtemas: [crearSubtemaVacio()],
          });
        }
        return prevDespues;
      });

      alert("🗑️ Tema eliminado correctamente.");
    } catch (error) {
      console.error(
        "Error al eliminar tema:",
        error.response?.data || error.message
      );
      alert(
        "❌ Error al eliminar el tema. Revisa la consola para más detalles."
      );
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: "2rem" }}>Cargando temas de la materia...</div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem 4rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/materias")}
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
        ← Volver a materias
      </button>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* Columna izquierda: lista de temas */}
        <aside
          style={{
            width: "260px",
            background: "white",
            borderRadius: "20px",
            padding: "1.25rem 1rem",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
            }}
          >
            Temas de la materia
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              marginBottom: "0.75rem",
            }}
          >
            {materiaId}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              marginBottom: "0.9rem",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {temasLista.map((t) => {
              const esActivo = t.id === temaActualId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => manejarSeleccionTema(t)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.45rem 0.7rem",
                    borderRadius: "999px",
                    border: "none",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    background: esActivo
                      ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                      : "#f3f4f6",
                    color: esActivo ? "#ffffff" : "#111827",
                    fontWeight: esActivo ? 600 : 500,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.titulo || "(Sin título)"}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={manejarNuevoTema}
            style={{
              width: "100%",
              padding: "0.55rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #0f766e 100%)",
              color: "white",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
            }}
          >
            <span>＋</span> Nuevo tema
          </button>
        </aside>

        {/* Columna derecha: formulario del tema */}
        <section
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "1.75rem",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
            maxWidth: "950px",
            flex: 1,
          }}
        >
          {/* 🔹 ENCABEZADO CON BOTÓN DE RESULTADOS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "0.8rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                Temas de la materia: {materiaNombre}
              </h1>
              {temaActualId && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    marginTop: "0.15rem",
                  }}
                >
                  Tema seleccionado:{" "}
                  <strong>{tema.titulo || "(Sin título)"}</strong>
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                alignItems: "center",
              }}
            >
              {/* 📊 Ver resultados de quizzes */}
              {temaActualId && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/materias/${materiaId}/temas/${temaActualId}/resultados`,
                      {
                        state: {
                          materiaNombre,
                          temaTitulo: tema.titulo,
                          subtemas: tema.subtemas,
                        },
                      }
                    )
                  }
                  style={{
                    borderRadius: "999px",
                    border: "none",
                    background: "#e0f2fe",
                    color: "#0369a1",
                    fontSize: "0.8rem",
                    padding: "0.35rem 0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  📊 Ver resultados de quizzes
                </button>
              )}

              {/* Botón eliminar tema actual */}
              <button
                type="button"
                onClick={handleEliminarTemaActual}
                style={{
                  borderRadius: "999px",
                  border: "none",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.8rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                🗑️ Eliminar tema
              </button>
            </div>
          </div>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "1.2rem",
              fontSize: "0.85rem",
            }}
          >
            Define los temas principales de la asignatura, sus subtemas y las
            preguntas de quiz que usarás para evaluar a los estudiantes.
          </p>

          {/* Tarjeta principal del tema */}
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Título del tema
              </label>
              <input
                type="text"
                value={tema.titulo}
                onChange={(e) => handleChangeTema("titulo", e.target.value)}
                className="input-form"
                placeholder="Ej. ¿Qué es la programación?"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Descripción breve del tema (opcional)
              </label>
              <textarea
                rows={3}
                value={tema.descripcion}
                onChange={(e) =>
                  handleChangeTema("descripcion", e.target.value)
                }
                className="input-form"
                placeholder="Qué se verá en este tema, propósito, alcance..."
                style={{ width: "100%" }}
              />
            </div>

            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}
            >
              Subtemas
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {tema.subtemas.map((st, indexSt) => (
                <div
                  key={st.id || indexSt}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    padding: "1rem 1.25rem",
                    background: "#f9fafb",
                  }}
                >
                  {/* Encabezado del subtema */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Título del subtema
                      </label>
                      <input
                        type="text"
                        value={st.titulo}
                        onChange={(e) =>
                          handleChangeSubtemaCampo(
                            indexSt,
                            "titulo",
                            e.target.value
                          )
                        }
                        className="input-form"
                        placeholder="Ej. Lenguaje de programación"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEliminarSubtema(indexSt)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#dc2626",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Eliminar subtema
                    </button>
                  </div>

                  {/* Checkboxes de tipo */}
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={st.mostrarInfo}
                        onChange={(e) =>
                          handleToggleInfo(indexSt, e.target.checked)
                        }
                      />
                      Información
                    </label>

                    <label
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={st.mostrarQuiz}
                        onChange={(e) =>
                          handleToggleQuiz(indexSt, e.target.checked)
                        }
                      />
                      Quiz
                    </label>
                  </div>

                  {/* Contenido informativo del subtema */}
                  {st.mostrarInfo && (
                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        Contenido del subtema
                      </label>
                      <textarea
                        rows={3}
                        value={st.contenido}
                        onChange={(e) =>
                          handleChangeSubtemaCampo(
                            indexSt,
                            "contenido",
                            e.target.value
                          )
                        }
                        className="input-form"
                        placeholder="Escribe la explicación del subtema..."
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                      />
                      <button
                        type="button"
                        onClick={handleGenerarContenidoIA}
                        style={{
                          padding: "0.4rem 0.9rem",
                          borderRadius: "999px",
                          border: "none",
                          background:
                            "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                          color: "white",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ✨ Generar con IA (desactivado)
                      </button>
                    </div>
                  )}

                  {/* Sección de quiz */}
                  {st.mostrarQuiz && (
                    <div
                      style={{
                        borderTop: "1px dashed #e5e7eb",
                        paddingTop: "0.75rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          marginBottom: "0.25rem",
                        }}
                      >
                        Preguntas del quiz
                      </div>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#6b7280",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Agrega las preguntas y marca cuál opción es la
                        correcta. Más adelante la IA podrá calificarlas
                        automáticamente.
                      </p>

                      {(st.preguntas || []).length === 0 && (
                        <p
                          style={{
                            fontSize: "0.78rem",
                            color: "#9ca3af",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Aún no hay preguntas. Usa el botón{" "}
                          <strong>“Agregar pregunta”</strong> para empezar.
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {(st.preguntas || []).map((preg, indexPreg) => (
                          <div
                            key={preg.id || indexPreg}
                            style={{
                              borderRadius: "10px",
                              border: "1px solid #e5e7eb",
                              padding: "0.6rem 0.75rem",
                              background: "white",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.4rem",
                                gap: "0.5rem",
                              }}
                            >
                              <label
                                style={{
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                }}
                              >
                                Pregunta {indexPreg + 1}
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEliminarPregunta(indexSt, indexPreg)
                                }
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#dc2626",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={preg.enunciado}
                              onChange={(e) =>
                                handleCambioEnunciado(
                                  indexSt,
                                  indexPreg,
                                  e.target.value
                                )
                              }
                              className="input-form"
                              placeholder="Escribe el enunciado de la pregunta..."
                              style={{
                                width: "100%",
                                marginBottom: "0.5rem",
                              }}
                            />

                            <div
                              style={{
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                marginBottom: "0.25rem",
                              }}
                            >
                              Opciones
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.35rem",
                                marginBottom: "0.4rem",
                              }}
                            >
                              {(preg.opciones || []).map((op, indexOp) => (
                                <label
                                  key={op.id || indexOp}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    fontSize: "0.78rem",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`correcta-${indexSt}-${indexPreg}`}
                                    checked={!!op.esCorrecta}
                                    onChange={() =>
                                      handleMarcarCorrecta(
                                        indexSt,
                                        indexPreg,
                                        indexOp
                                      )
                                    }
                                  />
                                  <input
                                    type="text"
                                    value={op.texto}
                                    onChange={(e) =>
                                      handleCambioTextoOpcion(
                                        indexSt,
                                        indexPreg,
                                        indexOp,
                                        e.target.value
                                      )
                                    }
                                    className="input-form"
                                    placeholder={`Opción ${indexOp + 1}`}
                                    style={{ flex: 1 }}
                                  />
                                </label>
                              ))}
                            </div>

                            {(preg.opciones || []).length < 4 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAgregarOpcion(indexSt, indexPreg)
                                }
                                style={{
                                  borderRadius: "999px",
                                  border: "1px dashed #9ca3af",
                                  background: "white",
                                  fontSize: "0.75rem",
                                  padding: "0.25rem 0.7rem",
                                  cursor: "pointer",
                                }}
                              >
                                + Agregar opción
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAgregarPregunta(indexSt)}
                        style={{
                          borderRadius: "999px",
                          border: "none",
                          background: "#22c55e",
                          color: "white",
                          fontSize: "0.8rem",
                          padding: "0.35rem 0.9rem",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        ➕ Agregar pregunta
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Botones inferiores */}
            <div
              style={{
                marginTop: "1.25rem",
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleAgregarSubtema}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "999px",
                  border: "1px dashed #9ca3af",
                  background: "white",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <span>＋</span>
                Agregar subtema
              </button>

              <button
                type="button"
                onClick={handleGuardarTema}
                disabled={guardando}
                style={{
                  padding: "0.6rem 1.4rem",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #0f766e 100%)",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: guardando ? 0.8 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {guardando ? "Guardando..." : "💾 Guardar tema (con subtemas)"}
              </button>
            </div>

            {hayCambiosSinGuardar && (
              <div
                style={{
                  marginTop: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "999px",
                  backgroundColor: "#fef3c7", // amarillo suave
                  color: "#92400e",
                  fontSize: "0.8rem",
                }}
              >
                <span>⚠️</span>
                <span>
                  Tienes cambios sin guardar. No olvides presionar{" "}
                  <strong>“Guardar tema (con subtemas)”</strong>.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
