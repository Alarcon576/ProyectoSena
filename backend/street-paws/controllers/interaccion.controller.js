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