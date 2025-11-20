import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function SignUp() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("alumno"); // valor por defecto
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !email || !password) {
      Swal.fire("Campos incompletos", "Por favor llena todos los campos", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/auth/register", {
        nombre,
        email,
        password,
        rol,
      });

      Swal.fire({
        icon: "success",
        title: "Registro exitoso 🎉",
        text: res.data.mensaje || "Tu cuenta ha sido creada correctamente.",
      });

      // Guardar token si el backend lo devuelve
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
      } else {
        // Si no devuelve token, regresar al login
        window.location.href = "/";
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text:
          error.response?.data?.mensaje ||
          "Hubo un problema al crear la cuenta. Intenta más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Registro MentorProg</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="alumno">Alumno</option>
          <option value="docente">Docente</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <p style={{ marginTop: "10px" }}>
        ¿Ya tienes cuenta?{" "}
        <a href="/" style={{ color: "#3085d6" }}>
          Inicia sesión aquí
        </a>
      </p>
    </div>
  );
}

export default SignUp;
