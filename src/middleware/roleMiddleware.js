// src/middleware/roleMiddleware.js
// Middleware para validar roles desde el token JWT

export const requireRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario; // lo coloca verificarToken

      if (!usuario || !usuario.rol) {
        return res.status(401).json({
          mensaje: "No hay información de usuario en la petición",
        });
      }

      const rolUsuario = usuario.rol;
      console.log("🔐 Verificando rol:", { rolUsuario, rolesPermitidos });

      const permitido = rolesPermitidos.includes(rolUsuario);

      if (!permitido) {
        return res.status(403).json({
          mensaje: "No tienes permisos para realizar esta acción",
        });
      }

      next();
    } catch (error) {
      console.error("❌ Error en requireRoles:", error);
      res.status(500).json({ mensaje: "Error interno en validación de roles" });
    }
  };
};

// Atajo para admin (azúcar sintáctica)
export const requireAdminRole = requireRoles("admin");
