import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =====================
// ❤️ TOGGLE LIKE
// =====================
export const toggleLike = async (req, res) => {
  try {
    const id_publicacion = parseInt(req.params.id);
    const id_usuario = req.user.id;

    const likeExistente = await prisma.like.findFirst({
      where: {
        id_publicacion,
        id_usuario
      }
    });

    if (likeExistente) {
      await prisma.like.delete({
        where: {
          id_like: likeExistente.id_like
        }
      });

      return res.json({ mensaje: "Like eliminado" });
    }

    await prisma.like.create({
      data: {
        id_publicacion,
        id_usuario,
        fecha_like: new Date()
      }
    });

    res.json({ mensaje: "Like agregado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// 💬 CREAR COMENTARIO
// =====================
export const crearComentario = async (req, res) => {
  try {
    const id_publicacion = parseInt(req.params.id);
    const id_usuario = req.user.id;
    const { contenido } = req.body;

    const comentario = await prisma.comentario.create({
      data: {
        id_publicacion,
        id_usuario,
        contenido,
        fecha_comentario: new Date()
      },
      include: {
        usuario: true
      }
    });

    res.status(201).json(comentario);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =====================
// ✏️ EDITAR COMENTARIO
// =====================
export const actualizarComentario = async (req, res) => {
  try {
    const id_comentario = parseInt(req.params.id);
    const id_usuario = req.user.id;
    const { contenido } = req.body;

    // Verificar que el comentario exista y sea del usuario
    const comentario = await prisma.comentario.findUnique({
      where: { id_comentario }
    });

    if (!comentario) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    if (comentario.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const actualizado = await prisma.comentario.update({
      where: { id_comentario },
      data: { contenido }
    });

    res.json(actualizado);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// 🗑 ELIMINAR COMENTARIO
// =====================
export const eliminarComentario = async (req, res) => {
  try {
    const id_comentario = parseInt(req.params.id);
    const id_usuario = req.user.id;

    const comentario = await prisma.comentario.findUnique({
      where: { id_comentario }
    });

    if (!comentario) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    if (comentario.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await prisma.comentario.delete({
      where: { id_comentario }
    });

    res.json({ mensaje: "Comentario eliminado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};