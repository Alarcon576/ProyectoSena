import {
  crearMascota,
  obtenerMascotas,
  obtenerMascotaPorId,
  actualizarMascota,
  eliminarMascota
} from '../services/mascota.service.js';

// Crear
export const crear = async (req, res) => {
  try {
    const nuevaMascota = await crearMascota(req.body);
    res.status(201).json(nuevaMascota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar
export const listar = async (req, res) => {
  try {
    const mascotas = await obtenerMascotas();
    res.json(mascotas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener por ID
export const obtener = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mascota = await obtenerMascotaPorId(id);

    if (!mascota) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.json(mascota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar
export const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mascotaActualizada = await actualizarMascota(id, req.body);
    res.json(mascotaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
export const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await eliminarMascota(id);
    res.json({ mensaje: 'Mascota eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};