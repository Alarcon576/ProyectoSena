import { PrismaClient } from "@prisma/client";
import {
  crearPublicacion,
  obtenerPublicaciones,
  obtenerPublicacionPorId,
  actualizarPublicacion,
  eliminarPublicacion
} from "../services/publicacion.service.js";
import {
  moderarTexto,
  validarTematicaMascotas,
  validarRelevanciaConIA
} from "../services/moderation.service.js";
const prisma = new PrismaClient();

// 🟢 CREAR
// CREAR
export const crear = async (req, res) => {
  try {
    const contenido = req.body.contenido_texto;

    // CAPA 1 → seguridad
    const revisionIA = await moderarTexto(contenido);

    if (revisionIA.flagged) {
      return res.status(400).json({
        error:
          "La publicación contiene contenido no permitido"
      });
    }

    // CAPA 2A → palabras clave
    const tematicaValida =
      validarTematicaMascotas(contenido);

    // CAPA 2B → IA semántica
    const relevanciaIA =
      await validarRelevanciaConIA(contenido);

    if (!tematicaValida && !relevanciaIA) {
      return res.status(400).json({
        error:
          "La publicación debe estar relacionada con mascotas o rescate animal"
      });
    }

    const data = {
      id_usuario: req.user.id,
      contenido_texto: contenido,
      fecha_publicacion: new Date()
    };

    const nuevaPublicacion = await crearPublicacion(data);

    if (req.file) {
      await prisma.imagen_Post.create({
        data: {
          id_publicacion: nuevaPublicacion.id_publicacion,
          url_imagen: req.file.path
        }
      });
    }

    res.status(201).json(nuevaPublicacion);
  } catch (error) {
    console.error("ERROR CREAR POST:", error);
    res.status(500).json({ error: error.message });
  }
};
// 📋 LISTAR FEED
export const listar = async (req, res) => {
  try {
    const publicaciones = await obtenerPublicaciones();
    res.json(publicaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 OBTENER 1
export const obtener = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await obtenerPublicacionPorId(id);

    if (!post) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json(post);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ ACTUALIZAR
export const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contenido = req.body.contenido_texto;

    const revisionIA = await moderarTexto(contenido);

    if (revisionIA.flagged) {
      return res.status(400).json({
        error:
          "El contenido editado no cumple las normas"
      });
    }

    const tematicaValida =
      validarTematicaMascotas(contenido);

    const relevanciaIA =
      await validarRelevanciaConIA(contenido);

    if (!tematicaValida && !relevanciaIA) {
      return res.status(400).json({
        error:
          "La publicación debe seguir relacionada con mascotas"
      });
    }

    const data = {
      contenido_texto: contenido
    };

    const postActualizado =
      await actualizarPublicacion(id, data);

    if (req.file) {
      const imagenExistente =
        await prisma.imagen_Post.findFirst({
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

    res.json(postActualizado);
  } catch (error) {
    console.error("ERROR UPDATE POST:", error);
    res.status(500).json({ error: error.message });
  }
};

// ❌ ELIMINAR
export const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

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

    res.json({ mensaje: "Publicación eliminada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


