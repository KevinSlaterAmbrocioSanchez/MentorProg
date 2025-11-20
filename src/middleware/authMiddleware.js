import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verificarToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Acceso denegado. Token no proporcionado." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Guarda los datos del usuario (email, rol)
    next(); // Permite continuar a la ruta protegida
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado." });
  }
};
export const verificarRol = (rolesPermitidos = []) => {
  // Si rolesPermitidos viene en formato spread (...rolesPermitidos)
  // y no como array, lo convertimos en uno plano
  if (!Array.isArray(rolesPermitidos)) {
    rolesPermitidos = [rolesPermitidos];
  }

  return (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
      return res.status(403).json({ mensaje: "No se encontró rol en el token." });
    }

    const rolUsuario = req.usuario.rol.toLowerCase();
    const rolesValidos = rolesPermitidos.flat().map((r) => r.toLowerCase());

    console.log("🔎 Rol detectado:", rolUsuario);
    console.log("✅ Roles permitidos:", rolesValidos);

    if (!rolesValidos.includes(rolUsuario)) {
      return res.status(403).json({
        mensaje: "Acceso denegado: rol no autorizado.",
        rolUsuario,
        rolesValidos,
      });
    }

    next();
  };
};
