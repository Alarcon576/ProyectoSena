import {
  crearSolicitud,
  obtenerSolicitudes,
  obtenerSolicitudesUsuario,
  actualizarSolicitud,
  eliminarSolicitud,
} from "../services/solicitud.service.js";

export const crear = async (req, res) => {
  try {
    // Datos base de la solicitud (igual que antes)
    const solicitudData = {
      id_usuario: req.user.id,
      id_mascota: parseInt(req.body.id_mascota),
      fecha_solicitud: new Date(),
      estado: "Pendiente",
      notas: req.body.notas || null,
    };

    const {
      nombre_completo,
      telefono,
      correo,
      direccion,
      tipo_vivienda,
      experiencia_mascotas,
      motivo_adopcion,
    } = req.body;

    const tieneFormulario = nombre_completo || telefono || correo || direccion;

    const formularioData = tieneFormulario
      ? {
          nombre_completo: nombre_completo || "",
          telefono: telefono || "",
          correo: correo || "",
          direccion: direccion || "",
          tipo_vivienda: tipo_vivienda || "",
          experiencia_mascotas: experiencia_mascotas || "",
          motivo_adopcion: motivo_adopcion || "",
        }
      : null;

    const nuevaSolicitud = await crearSolicitud(solicitudData, formularioData);

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error("Error creando solicitud:", error);
    res.status(500).json({ error: error.message });
  }
};

// El resto de controladores no cambia
export const listar = async (req, res) => {
  try {
    const solicitudes = await obtenerSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const misSolicitudes = async (req, res) => {
  try {
    const solicitudes = await obtenerSolicitudesUsuario(req.user.id);
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = { estado: req.body.estado, notas: req.body.notas };
    res.json(await actualizarSolicitud(id, data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    await eliminarSolicitud(parseInt(req.params.id));
    res.json({ mensaje: "Solicitud eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
