import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;

  const token = localStorage.getItem("token");

  // =========================
  // 📥 Obtener todos los usuarios
  // =========================
  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:3000/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data.usuarios || []);
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
    }
  };

  // =========================
  // ➕ Crear nuevo usuario
  // =========================
  const crearUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password) {
      return Swal.fire("⚠️ Campos incompletos", "Completa todos los campos.", "warning");
    }

    try {
      await axios.post(
        "http://localhost:3000/usuarios",
        { ...nuevoUsuario, rol: "alumno" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "✅ Usuario creado",
        text: "El nuevo alumno fue registrado correctamente.",
        confirmButtonColor: "#2563eb",
      });

      setNuevoUsuario({ nombre: "", email: "", password: "" });
      obtenerUsuarios();
    } catch (error) {
      Swal.fire("Error", "No se pudo registrar el usuario.", "error");
    }
  };

  // =========================
  // ✏️ Editar usuario
  // =========================
  const editarUsuario = async (usuario) => {
    const { value: formValues } = await Swal.fire({
      title: "✏️ Editar Usuario",
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre" value="${usuario.nombre}">
        <input id="email" class="swal2-input" placeholder="Correo" value="${usuario.email}">
        <select id="rol" class="swal2-select">
          <option value="alumno" ${usuario.rol === "alumno" ? "selected" : ""}>Alumno</option>
          <option value="docente" ${usuario.rol === "docente" ? "selected" : ""}>Docente</option>
          <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Admin</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "💾 Guardar cambios",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      preConfirm: () => {
        const nombre = document.getElementById("nombre").value;
        const email = document.getElementById("email").value;
        const rol = document.getElementById("rol").value;
        if (!nombre || !email) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        return { nombre, email, rol };
      },
    });

    if (formValues) {
      try {
        await axios.put(`http://localhost:3000/usuarios/${usuario.id}`, formValues, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("✅ Actualizado", "Usuario modificado correctamente.", "success");
        obtenerUsuarios();
      } catch (error) {
        Swal.fire("Error", "No se pudo actualizar el usuario.", "error");
      }
    }
  };

  // =========================
  // 🗑️ Eliminar usuario
  // =========================
  const eliminarUsuario = async (id) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (confirmar.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("🗑️ Eliminado", "El usuario ha sido eliminado.", "success");
        obtenerUsuarios();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  // =========================
  // 🔍 Filtrar usuarios por búsqueda
  // =========================
 const usuariosFiltrados = Array.isArray(usuarios)
  ? usuarios.filter((u) => {
      const nombre = u?.nombre?.toLowerCase() || "";
      const email = u?.email?.toLowerCase() || "";
      const termino = busqueda.toLowerCase();
      return nombre.includes(termino) || email.includes(termino);
    })
  : [];

  // =========================
  // 📄 Paginación
  // =========================
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const cambiarPagina = (num) => setPaginaActual(num);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // =========================
  // 🎨 Estilos visuales
  // =========================
  const inputStyle = {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    outline: "none",
  };

  const botonAzul = {
    background: "#2563eb",
    color: "white",
    fontWeight: "600",
    padding: "0.8rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "0.5rem",
    transition: "0.3s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)",
        padding: "3rem",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          padding: "2.5rem",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1d4ed8",
            fontWeight: "800",
            fontSize: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          👥 Gestión de Usuarios
        </h1>

        {/* FORMULARIO */}
        <div
          style={{
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #bfdbfe",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              color: "#1e40af",
              marginBottom: "1rem",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ➕ Registrar nuevo usuario
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoUsuario.nombre}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Correo institucional"
              value={nuevoUsuario.email}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Contraseña temporal"
              value={nuevoUsuario.password}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
              style={inputStyle}
            />
            <button onClick={crearUsuario} style={botonAzul}>
              Crear Usuario
            </button>
          </div>
        </div>

        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          style={{
            ...inputStyle,
            width: "100%",
            marginBottom: "1.5rem",
            border: "2px solid #93c5fd",
          }}
        />

        {/* LISTA */}
        {usuariosActuales.length > 0 ? (
          usuariosActuales.map((u) => (
            <div
              key={u.id}
              style={{
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                padding: "1rem 1.5rem",
                marginBottom: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.3s ease",
              }}
            >
              <div>
                <h4 style={{ margin: 0, color: "#1e3a8a", fontWeight: "600" }}>{u.nombre}</h4>
                <p style={{ margin: "0.3rem 0", color: "#374151" }}>{u.email}</p>
                <small
                  style={{
                    color: "#6b7280",
                    fontStyle: "italic",
                    background: "#e0e7ff",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Rol: {u.rol}
                </small>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => editarUsuario(u)}
                  style={{
                    background: "#0284c7",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ✏️ Editar
                </button>

                <button
                  onClick={() => eliminarUsuario(u.id)}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#6b7280", fontStyle: "italic" }}>
            No hay usuarios registrados o no coinciden con la búsqueda.
          </p>
        )}

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1.5rem",
              gap: "0.5rem",
            }}
          >
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                onClick={() => cambiarPagina(i + 1)}
                style={{
                  background: paginaActual === i + 1 ? "#2563eb" : "#dbeafe",
                  color: paginaActual === i + 1 ? "white" : "#1e3a8a",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 0.9rem",
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

export default Usuarios;
