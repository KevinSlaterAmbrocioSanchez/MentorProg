import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

function Materias() {
  const { usuario } = useContext(AuthContext);
  const [materias, setMaterias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cupo, setCupo] = useState(30);
  const [descripcion, setDescripcion] = useState("");
  const [docentes, setDocentes] = useState([]);
  const [docenteEmail, setDocenteEmail] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const materiasPorPagina = 5;
  const [cargando, setCargando] = useState(true);

  const API_URL = "http://localhost:3000/materias";

  // ===============================
  // 🔹 Cargar materias
  // ===============================
  const obtenerMaterias = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterias(res.data.materias || []);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las materias", "error");
    } finally {
      setCargando(false);
    }
  };

  // ===============================
  // 🔹 Cargar lista de docentes (solo admin)
  // ===============================
  const obtenerDocentes = async () => {
    try {
      if (usuario?.rol !== "admin") return;
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/usuarios/docentes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocentes(res.data.docentes || []);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los docentes", "error");
    }
  };

  useEffect(() => {
    obtenerMaterias();
    obtenerDocentes();
  }, []);

  // ===============================
  // 🔹 Crear nueva materia
  // ===============================
  const crearMateria = async (e) => {
    e.preventDefault();

    if (!nombre || !codigo) {
      Swal.fire("Campos incompletos", "Debes llenar nombre y código", "warning");
      return;
    }

    if (usuario?.rol === "admin" && !docenteEmail) {
      Swal.fire("Selecciona docente", "Debes asignar un docente a la materia", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        nombre,
        codigo,
        cupo,
        descripcion,
        docenteEmail: usuario?.rol === "admin" ? docenteEmail : usuario.email,
      };

      await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("✅ Éxito", "Materia creada correctamente", "success");
      setNombre("");
      setCodigo("");
      setCupo(30);
      setDescripcion("");
      setDocenteEmail("");
      obtenerMaterias();
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (error) {
      Swal.fire("Error", "No se pudo crear la materia", "error");
    }
  };

  // ===============================
  // 🔹 Eliminar materia
  // ===============================
  const eliminarMateria = async (id) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar materia?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (confirmar.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("🗑️ Eliminada", "La materia ha sido eliminada", "success");
        obtenerMaterias();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar la materia", "error");
      }
    }
  };

  // ===============================
  // 🔍 Filtro + paginación (a prueba de errores)
  // ===============================
  const materiasFiltradas = Array.isArray(materias)
    ? materias.filter((m) => {
        const termino = busqueda.toLowerCase();

        const nombre = m?.nombre?.toLowerCase() || "";
        const codigo = m?.codigo?.toLowerCase() || "";
        const docente = m?.docenteEmail?.toLowerCase() || "";

        return (
          nombre.includes(termino) ||
          codigo.includes(termino) ||
          docente.includes(termino)
        );
      })
    : [];

  const indiceUltimo = paginaActual * materiasPorPagina;
  const indicePrimero = indiceUltimo - materiasPorPagina;
  const materiasActuales = materiasFiltradas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(materiasFiltradas.length / materiasPorPagina);

  if (cargando) return <p style={{ textAlign: "center" }}>Cargando...</p>;

  // ===============================
  // 🎨 Estilos elegantes
  // ===============================
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    fontSize: "1rem",
    background: "#fff",
    color: "#000",
    marginTop: "10px",
    outline: "none",
  };

  const btnPrimary = {
    backgroundColor: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 0",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    width: "100%",
    marginTop: "15px",
  };

  const container = {
    maxWidth: "700px",
    margin: "2rem auto",
    background: "#f8f9fa",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const cardMateria = {
    background: "#fff",
    borderRadius: "10px",
    padding: "1rem 1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  // ===============================
  // 🧱 Render principal
  // ===============================
  return (
    <div style={{ minHeight: "100vh", background: "#eef3ff", paddingBottom: "4rem" }}>
      <div style={container}>
        <h1 style={{ textAlign: "center", color: "#0d6efd", fontWeight: "700" }}>
          📘 Gestión de Materias
        </h1>

        {(usuario?.rol === "admin" || usuario?.rol === "docente") && (
          <form onSubmit={crearMateria} style={{ marginBottom: "2rem" }}>
            <input
              type="text"
              placeholder="Nombre de la materia"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Cupo"
              value={cupo}
              onChange={(e) => setCupo(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ ...inputStyle, minHeight: "70px" }}
            />

            {usuario?.rol === "admin" && (
              <select
                value={docenteEmail}
                onChange={(e) => setDocenteEmail(e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccionar docente...</option>
                {docentes.length > 0 ? (
                  docentes.map((d) => (
                    <option key={d.email} value={d.email}>
                      {d.nombre} — {d.email}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay docentes disponibles</option>
                )}
              </select>
            )}

            <button type="submit" style={btnPrimary}>
              ➕ Crear Materia
            </button>
          </form>
        )}

        {/* 🔍 Buscador */}
        <div style={{ position: "relative", marginBottom: "1.5rem" }}>
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#0d6efd",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar materia, código o docente..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            style={{
              width: "100%",
              padding: "0.8rem 0.8rem 0.8rem 2rem",
              borderRadius: "8px",
              border: "1px solid #bcd0ff",
              background: "#ffffff",
              color: "#111827",
              fontSize: "1rem",
            }}
          />
        </div>

        <h2 style={{ color: "#333", marginBottom: "1rem" }}>📚 Lista de Materias</h2>

        {materiasActuales.length > 0 ? (
          materiasActuales.map((m) => (
            <div key={m.id} style={cardMateria}>
              <b style={{ color: "#0d6efd", fontSize: "1.1rem" }}>
                {m?.nombre || "Sin nombre"} ({m?.codigo || "N/A"})
              </b>

              {m?.descripcion && (
                <p
                  style={{
                    color: "#444",
                    fontStyle: "italic",
                    margin: "8px 0",
                    background: "#f8f9fa",
                    padding: "6px 10px",
                    borderRadius: "6px",
                  }}
                >
                  📝 {m.descripcion}
                </p>
              )}

              <p style={{ color: "#000", margin: "6px 0" }}>
                <b>Cupo:</b> {m?.cupo || 0}
              </p>

              <small style={{ color: "#333" }}>
                👩‍🏫 {m?.docenteNombre ? `${m.docenteNombre} — ${m.docenteEmail}` : m?.docenteEmail}
              </small>

              {(usuario?.rol === "admin" || usuario?.email === m?.docenteEmail) && (
                <button
                  onClick={() => eliminarMateria(m.id)}
                  style={{
                    float: "right",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    marginTop: "5px",
                  }}
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
          ))
        ) : busqueda.length > 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", marginTop: "1rem" }}>
            🔍 No se encontraron materias con ese término.
          </p>
        ) : (
          <p>No hay materias registradas.</p>
        )}

        {/* 📄 Paginación */}
        {materiasFiltradas.length > materiasPorPagina && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1.5rem",
            }}
          >
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPaginaActual(i + 1)}
                style={{
                  background: paginaActual === i + 1 ? "#0d6efd" : "#e7f0ff",
                  color: paginaActual === i + 1 ? "white" : "#0d47a1",
                  border: "1px solid #bcd0ff",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Materias;
