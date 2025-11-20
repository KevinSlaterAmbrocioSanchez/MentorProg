import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Docentes() {
  const [docentes, setDocentes] = useState([]);
  const [nuevoDocente, setNuevoDocente] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const docentesPorPagina = 5;
  const token = localStorage.getItem("token");

  // 🔹 Obtener lista de docentes
  const obtenerDocentes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/usuarios/docentes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocentes(res.data.docentes || []);
    } catch (error) {
      Swal.fire("❌ Error", "No se pudieron cargar los docentes.", "error");
    }
  };

  // 🔹 Crear nuevo docente
  const crearDocente = async () => {
    if (!nuevoDocente.nombre || !nuevoDocente.email || !nuevoDocente.password)
      return Swal.fire("⚠️ Campos incompletos", "Completa todos los campos.", "warning");

    try {
      await axios.post(
        "http://localhost:3000/usuarios",
        { ...nuevoDocente, rol: "docente" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("✅ Éxito", "Docente creado correctamente.", "success");
      setNuevoDocente({ nombre: "", email: "", password: "" });
      obtenerDocentes();
    } catch (error) {
      Swal.fire("❌ Error", "No se pudo registrar el docente.", "error");
    }
  };

  // 🔹 Eliminar docente
  const eliminarDocente = async (id) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar docente?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmar.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("✅ Eliminado", "Docente eliminado correctamente.", "success");
        obtenerDocentes();
      } catch {
        Swal.fire("❌ Error", "No se pudo eliminar el docente.", "error");
      }
    }
  };

  // 🔍 Filtro con validación segura
  const docentesFiltrados = Array.isArray(docentes)
    ? docentes.filter((d) => {
        const nombre = d?.nombre?.toLowerCase() || "";
        const email = d?.email?.toLowerCase() || "";
        const termino = busqueda.toLowerCase();
        return nombre.includes(termino) || email.includes(termino);
      })
    : [];

  // 📄 Paginación
  const indiceUltimo = paginaActual * docentesPorPagina;
  const indicePrimero = indiceUltimo - docentesPorPagina;
  const docentesActuales = docentesFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(docentesFiltrados.length / docentesPorPagina);

  useEffect(() => {
    obtenerDocentes();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)",
        padding: "3rem 1rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          padding: "2rem 2.5rem",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#166534",
            fontWeight: "800",
            marginBottom: "2rem",
          }}
        >
          👨‍🏫 Gestión de Docentes
        </h1>

        {/* ➕ Formulario de registro */}
        <div
          style={{
            background: "#f0fdf4",
            border: "2px solid #bbf7d0",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ color: "#15803d", textAlign: "center", marginBottom: "1rem" }}>
            ➕ Registrar nuevo docente
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoDocente.nombre}
              onChange={(e) => setNuevoDocente({ ...nuevoDocente, nombre: e.target.value })}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Correo institucional"
              value={nuevoDocente.email}
              onChange={(e) => setNuevoDocente({ ...nuevoDocente, email: e.target.value })}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Contraseña temporal"
              value={nuevoDocente.password}
              onChange={(e) => setNuevoDocente({ ...nuevoDocente, password: e.target.value })}
              style={inputStyle}
            />
            <button onClick={crearDocente} style={btnCrear}>
              Crear Docente
            </button>
          </div>
        </div>

        {/* 🔍 Buscador */}
        <div style={{ position: "relative", marginBottom: "1.5rem" }}>
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#16a34a",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar docente por nombre o correo..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            style={{
              width: "100%",
              padding: "0.8rem 0.8rem 0.8rem 2rem",
              borderRadius: "8px",
              border: "1px solid #a7f3d0",
              background: "#ffffff",
              color: "#111827",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* 📋 Lista de docentes */}
        {docentesActuales?.length > 0 ? (
          docentesActuales.map((d) => (
            <div key={d.id} style={cardDocente}>
              <div>
                <h3 style={{ margin: "0 0 0.2rem 0", color: "#166534" }}>{d.nombre}</h3>
                <p style={{ margin: 0, color: "#374151" }}>{d.email}</p>
              </div>
              <button onClick={() => eliminarDocente(d.id)} style={btnEliminar}>
                🗑️ Eliminar
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            No hay docentes registrados o no coinciden con la búsqueda.
          </p>
        )}

        {/* 📄 PAGINACIÓN */}
        {docentesFiltrados.length > docentesPorPagina && (
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
                  background: paginaActual === i + 1 ? "#16a34a" : "#dcfce7",
                  color: paginaActual === i + 1 ? "white" : "#166534",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "0.2s",
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

// 🎨 Estilos reutilizables
const inputStyle = {
  padding: "0.8rem",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#f3f4f6",
  fontSize: "1rem",
  color: "#111827",
};

const btnCrear = {
  background: "#16a34a",
  color: "white",
  fontWeight: "600",
  padding: "0.8rem",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "0.3s",
};

const btnEliminar = {
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: "600",
  transition: "0.3s",
};

const cardDocente = {
  background: "white",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "1rem 1.5rem",
  marginBottom: "1rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export default Docentes;
