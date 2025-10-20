import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import { login } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUsuario } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      setUsuario({ email }); // opcional: luego se actualiza con getPerfil
      Swal.fire("Bienvenido", "Inicio de sesión exitoso", "success");
      window.location.href = "/dashboard";
    } catch (error) {
      Swal.fire("Error", error.response?.data?.mensaje || "Error al iniciar sesión", "error");
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
