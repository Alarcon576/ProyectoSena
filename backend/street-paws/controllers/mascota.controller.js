import { PrismaClient } from "@prisma/client";
import {
  crearMascota,
  obtenerMascotas,
  obtenerMascotaPorId,
  actualizarMascota,
  eliminarMascota
} from "../services/mascota.service.js";

const prisma = new PrismaClient();


export const crear = async (req, res) => {
  try {
    const data = {
      nombre: req.body.nombre,
      especie: req.body.especie,
      raza: req.body.raza,
      edad: parseInt(req.body.edad),
      sexo: req.body.sexo,
      estado_salud: req.body.estado_salud,
      fecha_ingreso: new Date(req.body.fecha_ingreso),
      estado_adopcion: req.body.estado_adopcion,
      id_admin_registro: req.user.id
    };

    const nuevaMascota = await crearMascota(data);

    
    if (req.file) {
      await prisma.foto_Mascota.create({
        data: {
          id_mascota: nuevaMascota.id_mascota,
          url_foto: req.file.path,
          es_principal: true
        }
      });
    }

    res.status(201).json(nuevaMascota);

  } catch (error) {
    console.error("ERROR CREAR:", error);
    res.status(500).json({ error: error.message });
  }
};


export const listar = async (req, res) => {
  try {
    const mascotas = await obtenerMascotas();
    res.json(mascotas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const obtener = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mascota = await obtenerMascotaPorId(id);

    if (!mascota) {
      return res.status(404).json({ error: "Mascota no encontrada" });
    }

    res.json(mascota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const data = {
      nombre: req.body.nombre,
      especie: req.body.especie,
      raza: req.body.raza,
      edad: parseInt(req.body.edad),
      sexo: req.body.sexo,
      estado_salud: req.body.estado_salud,
      fecha_ingreso: new Date(req.body.fecha_ingreso),
      estado_adopcion: req.body.estado_adopcion
    };

    const mascotaActualizada = await actualizarMascota(id, data);

    
    if (req.file) {

      
      const fotoPrincipal = await prisma.foto_Mascota.findFirst({
        where: {
          id_mascota: id,
          es_principal: true
        }
      });

      if (fotoPrincipal) {
        
        await prisma.foto_Mascota.update({
          where: { id_foto: fotoPrincipal.id_foto },
          data: { url_foto: req.file.path }
        });
      } else {
       
        await prisma.foto_Mascota.create({
          data: {
            id_mascota: id,
            url_foto: req.file.path,
            es_principal: true
          }
        });
      }
    }

    res.json(mascotaActualizada);

  } catch (error) {
    console.error("ERROR UPDATE:", error);
    res.status(500).json({ error: error.message });
  }
};


export const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    
    await prisma.foto_Mascota.deleteMany({
      where: { id_mascota: id }
    });

    await eliminarMascota(id);

    res.json({ mensaje: "Mascota eliminada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};