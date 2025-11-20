// frontend/src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "alumno", // valor por defecto
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
      const res = await axios.get(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔹 Soporta dos formatos:
      // 1) res.data = [ ... ]
      // 2) res.data = { usuarios: [ ... ] }
      const data = res.data;
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.usuarios)
        ? data.usuarios
        : [];

      setUsuarios(lista);
      return lista;
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
      setUsuarios([]);
      return [];
    }
  };

  // =========================
  // ➕ Crear nuevo usuario
  // =========================
  const crearUsuario = async () => {
    const { nombre, email, password, rol } = nuevoUsuario;

    if (!nombre || !email || !password || !rol) {
      return Swal.fire(
        "⚠️ Campos incompletos",
        "Completa todos los campos.",
        "warning"
      );
    }

    try {
      await axios.post(
        `${API_URL}/usuarios`,
        {
          nombre,
          email,
          password,
          rol,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "✅ Usuario creado",
        text: "El nuevo usuario fue registrado correctamente.",
        confirmButtonColor: "#2563eb",
      });

      setNuevoUsuario({
        nombre: "",
        email: "",
        password: "",
        rol: "alumno",
      });

      obtenerUsuarios();
    } catch (error) {
      console.error("❌ Error al crear usuario:", error.response?.data || error);
      Swal.fire(
        "Error",
        error.response?.data?.mensaje || "No se pudo registrar el usuario.",
        "error"
      );
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
          <option value="alumno" ${usuario.rol === "alumno" ? "selected" : ""}>Usuario</option>
          <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Administrador</option>
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
        if (!nombre || !email || !rol) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }
        return { nombre, email, rol };
      },
    });

    if (formValues) {
      try {
        await axios.put(
          `${API_URL}/usuarios/${usuario.id}`,
          formValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Swal.fire(
          "✅ Actualizado",
          "Usuario modificado correctamente.",
          "success"
        );
        obtenerUsuarios();
      } catch (error) {
        console.error(
          "❌ Error al actualizar usuario:",
          error.response?.data || error
        );
        Swal.fire(
          "Error",
          error.response?.data?.mensaje || "No se pudo actualizar el usuario.",
          "error"
        );
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
        await axios.delete(`${API_URL}/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire(
          "🗑️ Eliminado",
          "El usuario ha sido eliminado.",
          "success"
        );
        obtenerUsuarios();
      } catch (error) {
        console.error(
          "❌ Error al eliminar usuario:",
          error.response?.data || error
        );
        Swal.fire(
          "Error",
          error.response?.data?.mensaje || "No se pudo eliminar el usuario.",
          "error"
        );
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
  const usuariosActuales = usuariosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );
  const totalPaginas = Math.ceil(
    usuariosFiltrados.length / usuariosPorPagina
  );

  const cambiarPagina = (num) => setPaginaActual(num);

  // =========================
  // 🚀 Cargar usuarios al entrar a la página
  // =========================
  useEffect(() => {
    obtenerUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
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
          padding: "2.5rem 3rem",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "0.5rem",
            fontSize: "2rem",
            color: "#1d4ed8",
          }}
        >
          👥 Gestión de Usuarios
        </h1>
        <p
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#6b7280",
          }}
        >
          Administra los usuarios del sistema: registra, edita y elimina cuentas.
        </p>

        {/* FORMULARIO NUEVO USUARIO */}
        <div
          style={{
            border: "1px solid #dbeafe",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            background:
              "linear-gradient(145deg, rgba(239,246,255,0.8), #ffffff)",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              marginBottom: "1rem",
              color: "#1d4ed8",
              textAlign: "center",
            }}
          >
            ➕ Registrar nuevo usuario
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
          >
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoUsuario.nombre}
              onChange={(e) =>
                setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
              }
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Correo institucional"
              value={nuevoUsuario.email}
              onChange={(e) =>
                setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
              }
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Contraseña temporal"
              value={nuevoUsuario.password}
              onChange={(e) =>
                setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
              }
              style={inputStyle}
            />

            {/* Selector de rol */}
            <select
              value={nuevoUsuario.rol}
              onChange={(e) =>
                setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
              }
              style={{ ...inputStyle, backgroundColor: "#f9fafb" }}
            >
              <option value="alumno">Usuario</option>
              <option value="admin">Administrador</option>
            </select>

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
            borderRadius: "999px",
          }}
        />

        {/* LISTA DE USUARIOS */}
        {usuariosActuales.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontStyle: "italic",
            }}
          >
            No hay usuarios registrados o no coinciden con la búsqueda.
          </p>
        ) : (
          usuariosActuales.map((u) => (
            <div
              key={u.id}
              style={{
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                padding: "1rem 1.25rem",
                marginBottom: "0.9rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ffffff",
                boxShadow: "0 3px 8px rgba(15,23,42,0.06)",
              }}
            >
              <div>
                <strong style={{ fontSize: "1rem", color: "#111827" }}>
                  {u.nombre}
                </strong>
                <div style={{ fontSize: "0.9rem", color: "#4b5563" }}>
                  {u.email}
                </div>
                <small
                  style={{
                    color: "#6b7280",
                    fontStyle: "italic",
                    background: "#e0e7ff",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Rol:{" "}
                  {u.rol === "alumno"
                    ? "Usuario"
                    : u.rol === "admin"
                    ? "Administrador"
                    : u.rol}
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
        )}

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => cambiarPagina(i + 1)}
                style={{
                  borderRadius: "999px",
                  border: "1px solid #d1d5db",
                  padding: "0.3rem 0.8rem",
                  background:
                    paginaActual === i + 1 ? "#2563eb" : "#ffffff",
                  color: paginaActual === i + 1 ? "#ffffff" : "#374151",
                  cursor: "pointer",
                  fontSize: "0.9rem",
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
