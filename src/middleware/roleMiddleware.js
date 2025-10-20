// ===============================
// 🔐 Middleware para verificar roles de usuario
// ===============================
import dotenv from "dotenv";
dotenv.config();

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * @param {Array} rolesPermitidos - Ejemplo: ["admin", "docente"]
 */
export const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      // Verificamos si el middleware de autenticación ya agregó el usuario
      const usuario = req.usuario;
      if (!usuario)
        return res
          .status(401)
          .json({ mensaje: "No hay un usuario autenticado en la solicitud" });

      // Verificamos si el rol del usuario está entre los roles permitidos
      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({
          mensaje: `Acceso denegado. Este recurso requiere uno de los siguientes roles: ${rolesPermitidos.join(
            ", "
          )}`,
        });
      }

      // Si el rol es válido, continuamos
      next();
    } catch (error) {
      res.status(500).json({ error: "Error en verificación de rol" });
    }
  };
};
