// src/components/Login.jsx
import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 👇 usamos el login del contexto (ya habla con el backend)
      const ok = await login(email, password);

      if (ok) {
        Swal.fire("Bienvenido", "Inicio de sesión exitoso", "success");
        navigate("/dashboard");
      } else {
        Swal.fire(
          "Error",
          "Credenciales inválidas o problema en el servidor",
          "error"
        );
      }
    } catch (error) {
      console.error("Error en handleSubmit login:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error al iniciar sesión. Intenta de nuevo.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>MentorProg Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
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
        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}

export default Login;
