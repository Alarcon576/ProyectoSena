import { PrismaClient } from "@prisma/client";
import { moderarImagen } from "../services/imageModeration.js";
import { validarTemaMascota } from "../services/temaImagen.service.js";
import {
  crearPublicacion,
  obtenerPublicaciones,
  obtenerPublicacionPorId,
  actualizarPublicacion,
  eliminarPublicacion
} from "../services/publicacion.service.js";
import { validarPublicacion } from "../services/moderation.service.js";

const prisma = new PrismaClient();

/* =========================================================
   🟢 CREAR PUBLICACIÓN
========================================================= */
export const crear = async (req, res) => {
  try {
    const contenido = req.body.contenido_texto;

    // ✅ Validación completa de texto
    const resultado = await validarPublicacion(contenido);

    if (!resultado.valido) {
      return res.status(400).json({
        error: resultado.motivo
      });
    }

    // ✅ Validación de imagen
    if (req.file?.path) {
      const revisionImagen = await moderarImagen(req.file.path);

      if (revisionImagen.flagged) {
        return res.status(400).json({
          error: "La imagen contiene contenido no permitido"
        });
      }

      const tema = await validarTemaMascota(req.file.path);

      if (!tema.relacionado) {
        return res.status(400).json({
          error: "Solo se permiten imágenes relacionadas con mascotas"
        });
      }
    }

    const data = {
      id_usuario: req.user.id,
      contenido_texto: contenido,
      fecha_publicacion: new Date()
    };

    const nuevaPublicacion = await crearPublicacion(data);

    if (req.file?.path) {
      await prisma.imagen_Post.create({
        data: {
          id_publicacion: nuevaPublicacion.id_publicacion,
          url_imagen: req.file.path
        }
      });
    }

    return res.status(201).json(nuevaPublicacion);
  } catch (error) {
    console.error("ERROR CREAR POST:", error);
    return res.status(500).json({
      error: "Error interno creando la publicación"
    });
  }
};

/* =========================================================
   📋 LISTAR FEED
========================================================= */
export const listar = async (req, res) => {
  try {
    const publicaciones = await obtenerPublicaciones();
    return res.json(publicaciones);
  } catch (error) {
    return res.status(500).json({
      error: "Error obteniendo publicaciones"
    });
  }
};

/* =========================================================
   🔍 OBTENER UNA PUBLICACIÓN
========================================================= */
export const obtener = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const post = await obtenerPublicacionPorId(id);

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada"
      });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({
      error: "Error obteniendo publicación"
    });
  }
};

/* =========================================================
   ✏️ ACTUALIZAR PUBLICACIÓN
========================================================= */
export const actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const contenido = req.body.contenido_texto;

    // ✅ Validación completa
    const resultado = await validarPublicacion(contenido);

    if (!resultado.valido) {
      return res.status(400).json({
        error: resultado.motivo
      });
    }

    // ✅ Validar imagen nueva si llega
    if (req.file?.path) {
      const revisionImagen = await moderarImagen(req.file.path);

      if (revisionImagen.flagged) {
        return res.status(400).json({
          error: "La imagen contiene contenido no permitido"
        });
      }

      const tema = await validarTemaMascota(req.file.path);

      if (!tema.relacionado) {
        return res.status(400).json({
          error: "Solo se permiten imágenes relacionadas con mascotas"
        });
      }
    }

    const postActualizado = await actualizarPublicacion(id, {
      contenido_texto: contenido
    });

    // ✅ Actualizar o crear imagen
    if (req.file?.path) {
      const imagenExistente = await prisma.imagen_Post.findFirst({
        where: { id_publicacion: id }
      });

      if (imagenExistente) {
        await prisma.imagen_Post.update({
          where: {
            id_imagen: imagenExistente.id_imagen
          },
          data: {
            url_imagen: req.file.path
          }
        });
      } else {
        await prisma.imagen_Post.create({
          data: {
            id_publicacion: id,
            url_imagen: req.file.path
          }
        });
      }
    }

    return res.json(postActualizado);
  } catch (error) {
    console.error("ERROR UPDATE POST:", error);
    return res.status(500).json({
      error: "Error actualizando publicación"
    });
  }
};

/* =========================================================
   ❌ ELIMINAR PUBLICACIÓN
========================================================= */
export const eliminar = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.imagen_Post.deleteMany({
      where: { id_publicacion: id }
    });

    await prisma.comentario.deleteMany({
      where: { id_publicacion: id }
    });

    await prisma.like.deleteMany({
      where: { id_publicacion: id }
    });

    await eliminarPublicacion(id);

    return res.json({
      mensaje: "Publicación eliminada correctamente"
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error eliminando publicación"
    });
  }
};