// src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ok = await login(email, password);
    if (ok) {
      await Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Sesión iniciada",
        confirmButtonText: "OK",
      });

      // 👇 Aquí nos vamos al dashboard
      navigate("/");
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Credenciales inválidas o problema en el servidor",
      });
    }
  };

  return (
    <div className="page-center">
      <div className="card-login">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="correo@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
