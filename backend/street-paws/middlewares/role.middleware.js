export const soloAdmin = (req, res, next) => {
  try {
    if (req.user.rol !== 2) { // suponiendo que 2 = admin
      return res.status(403).json({ msg: "Acceso denegado, solo admin" });
    }

    next();
  } catch (error) {
    res.status(500).json({ msg: "Error en validación de rol" });
  }
};