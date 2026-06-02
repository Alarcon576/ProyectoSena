import {
  obtenerNotificaciones,
  marcarLeida
} from "../services/notificacion.service.js";

export const listar = async (req, res) => {
  try {

    const notificaciones =
      await obtenerNotificaciones(
        req.user.id
      );

    res.json(notificaciones);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};

export const leer = async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    const notificacion =
      await marcarLeida(id);

    res.json(notificacion);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};