import { PrismaClient } from "@prisma/client";
import { moderarTexto } from "../services/moderation.service.js";
import { crearNotificacion } from "../services/notificacion.service.js";

const prisma = new PrismaClient();

/* =====================
   🧠 MODERACIÓN LOCAL
===================== */
const validarComentario = async (contenido) => {
  const texto = contenido?.toLowerCase().trim();

  if (!texto) {
    return "El comentario no puede estar vacío";
  }

  if (texto.length > 300) {
    return "El comentario es demasiado largo";
  }

  if (
    texto.includes("http://") ||
    texto.includes("https://")
  ) {
    return "No se permiten links en comentarios";
  }

  const palabrasProhibidas = [
    "idiota",
    "estupido",
    "imbecil",
    "mierda",
    "gonorrea",
    "malparido",
    "pendejo",
    "puta",
    "maricon",
    "zorra",
    "cabrón",
    "hijo de puta",
    "petro",
    "uribe",
    "farc",
    "guerrillero",
    "terrorista",
    "abelardo",
    "corrupto",
    "ladrón",
    "rata",
    "payaso",
    "tonto",
    "cepeda",
    "mamahuevo",
    "hpta",
    "huevón",
    "mlp",
    "violador",
    "asesino",
    "racista",
    "machista",
    "homofóbico",
    "transfóbico",
    "xenófobo",
    "misógino",
    "misándrico",
    "nazi",
    "fascista",
    "dictador",
    "genocida",
    "pedófilo",
    "hp",
    "prb",
    "sebastian",
    "duque",
    "alvaro"
  ];

  const contieneBloqueado =
    palabrasProhibidas.some((p) =>
      texto.includes(p)
    );

  if (contieneBloqueado) {
    return "El comentario contiene lenguaje ofensivo";
  }

  const revision = await moderarTexto(contenido);

  if (revision.flagged) {
    return "El comentario no cumple las normas";
  }

  return null;
};

/* =====================
   ❤️ TOGGLE LIKE
===================== */
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

      return res.json({
        mensaje: "Like eliminado"
      });
    }

    await prisma.like.create({
      data: {
        id_publicacion,
        id_usuario,
        fecha_like: new Date()
      }
    });

    const publicacion =
      await prisma.publicacion.findUnique({
        where: {
          id_publicacion
        }
      });

    if (
      publicacion &&
      publicacion.id_usuario !== id_usuario
    ) {
      await crearNotificacion(
        publicacion.id_usuario,
        "❤️ Nuevo Like",
        "Alguien dio like a tu publicación",
        "LIKE",
        id_publicacion
      );
    }

    res.json({
      mensaje: "Like agregado"
    });

  } catch (error) {
    console.error(
      "Error toggleLike:",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
};

/* =====================
   💬 CREAR COMENTARIO
===================== */
export const crearComentario = async (
  req,
  res
) => {
  try {
    const id_publicacion =
      parseInt(req.params.id);

    const id_usuario =
      req.user.id;

    const { contenido } =
      req.body;

    const errorValidacion =
      await validarComentario(
        contenido
      );

    if (errorValidacion) {
      return res.status(400).json({
        error: errorValidacion
      });
    }

    const ultimoComentario =
      await prisma.comentario.findFirst({
        where: {
          id_publicacion,
          id_usuario
        },
        orderBy: {
          fecha_comentario: "desc"
        }
      });

    if (
      ultimoComentario &&
      ultimoComentario.contenido
        .toLowerCase()
        .trim() ===
      contenido
        .toLowerCase()
        .trim()
    ) {
      return res.status(400).json({
        error:
          "No puedes repetir el mismo comentario"
      });
    }

    const comentario =
      await prisma.comentario.create({
        data: {
          id_publicacion,
          id_usuario,
          contenido,
          fecha_comentario:
            new Date()
        },
        include: {
          usuario: true
        }
      });

    const publicacion =
      await prisma.publicacion.findUnique({
        where: {
          id_publicacion
        }
      });

    if (
      publicacion &&
      publicacion.id_usuario !==
        id_usuario
    ) {
      await crearNotificacion(
        publicacion.id_usuario,
        "💬 Nuevo comentario",
        "Han comentado tu publicación",
        "COMENTARIO",
        id_publicacion
      );
    }

    res.status(201).json(
      comentario
    );

  } catch (error) {

    console.error(
      "Error creando comentario:",
      error
    );

    res.status(500).json({
      error: error.message
    });

  }
};

/* =====================
   ✏️ EDITAR COMENTARIO
===================== */
export const actualizarComentario = async (
  req,
  res
) => {
  try {
    const id_comentario =
      parseInt(req.params.id);

    const id_usuario =
      req.user.id;

    const { contenido } =
      req.body;

    const comentario =
      await prisma.comentario.findUnique({
        where: {
          id_comentario
        }
      });

    if (!comentario) {
      return res.status(404).json({
        error:
          "Comentario no encontrado"
      });
    }

    if (
      comentario.id_usuario !==
      id_usuario
    ) {
      return res.status(403).json({
        error:
          "No autorizado"
      });
    }

    const errorValidacion =
      await validarComentario(
        contenido
      );

    if (errorValidacion) {
      return res.status(400).json({
        error: errorValidacion
      });
    }

    const actualizado =
      await prisma.comentario.update({
        where: {
          id_comentario
        },
        data: {
          contenido
        }
      });

    res.json(actualizado);

  } catch (error) {

    console.error(
      "Error editando comentario:",
      error
    );

    res.status(500).json({
      error: error.message
    });

  }
};

/* =====================
   🗑 ELIMINAR COMENTARIO
===================== */
export const eliminarComentario = async (
  req,
  res
) => {
  try {
    const id_comentario =
      parseInt(req.params.id);

    const id_usuario =
      req.user.id;

    const comentario =
      await prisma.comentario.findUnique({
        where: {
          id_comentario
        }
      });

    if (!comentario) {
      return res.status(404).json({
        error:
          "Comentario no encontrado"
      });
    }

    if (
      comentario.id_usuario !==
      id_usuario
    ) {
      return res.status(403).json({
        error:
          "No autorizado"
      });
    }

    await prisma.comentario.delete({
      where: {
        id_comentario
      }
    });

    res.json({
      mensaje:
        "Comentario eliminado"
    });

  } catch (error) {

    console.error(
      "Error eliminando comentario:",
      error
    );

    res.status(500).json({
      error: error.message
    });

  }
};