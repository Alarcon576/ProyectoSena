import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  try {
    let token;

    // 1. Obtener token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ msg: "No autorizado, no hay token" });
    }

    // 2. Verificar token
const decoded = jwt.decode(token);
console.log("DECODED:", decoded);

    // 3. Guardar datos del usuario en req
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({ msg: "Token inválido" });
  }
};