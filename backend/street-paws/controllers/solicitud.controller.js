import {
  crearSolicitud,
  obtenerSolicitudes,
  obtenerSolicitudesUsuario,
  actualizarSolicitud,
  eliminarSolicitud
} from "../services/solicitud.service.js";

// Crear solicitud
export const crear = async (req, res) => {
  try {
    const data = {
      id_usuario: req.user.id,
      id_mascota: parseInt(req.body.id_mascota),
      fecha_solicitud: new Date(),
      estado: "Pendiente",
      notas: req.body.notas || null
    };

    const nuevaSolicitud = await crearSolicitud(data);

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error("Error creando solicitud:", error);
    res.status(500).json({ error: error.message });
  }
};

// Listar todas (admin)
export const listar = async (req, res) => {
  try {
    const solicitudes = await obtenerSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    console.error("Error listando solicitudes:", error);
    res.status(500).json({ error: error.message });
  }
};

// Ver mis solicitudes
export const misSolicitudes = async (req, res) => {
  try {
    const solicitudes = await obtenerSolicitudesUsuario(req.user.id);
    res.json(solicitudes);
  } catch (error) {
    console.error("Error mis solicitudes:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ ACTUALIZAR ESTADO / NOTAS
export const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const data = {
      estado: req.body.estado,
      notas: req.body.notas
    };

    const actualizada = await actualizarSolicitud(id, data);

    res.json(actualizada);
  } catch (error) {
    console.error("Error actualizando solicitud:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
export const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await eliminarSolicitud(id);

    res.json({
      mensaje: "Solicitud eliminada correctamente"
    });
  } catch (error) {
    console.error("Error eliminando solicitud:", error);
    res.status(500).json({ error: error.message });
  }
};