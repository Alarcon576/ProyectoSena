import { PrismaClient } from "@prisma/client";
import { crearNotificacion } from "./notificacion.service.js";

const prisma = new PrismaClient();

export const crearSolicitud = async (data, formularioData = null) => {
  return await prisma.$transaction(async (tx) => {

    const solicitud = await tx.solicitud_Adopcion.create({
      data
    });

    if (formularioData) {
      await tx.formulario_Adopcion.create({
        data: {
          id_solicitud: solicitud.id_solicitud,
          ...formularioData
        }
      });
    }

    // 🔔 Notificar administradores
    const admins = await tx.usuario.findMany({
      where: {
        id_rol: 2
      }
    });

    const mascota = await tx.mascota.findUnique({
      where: {
        id_mascota: data.id_mascota
      }
    });

    for (const admin of admins) {
      await tx.notificacion.create({
        data: {
          id_usuario: admin.id_usuario,
          titulo: "🐾 Nueva solicitud",
          mensaje: `Nueva solicitud para adoptar a ${mascota?.nombre || "una mascota"}`,
          tipo: "SOLICITUD"
        }
      });
    }

    return solicitud;
  });
};

export const obtenerSolicitudes = async () => {
  return await prisma.solicitud_Adopcion.findMany({
    include: {
      usuario: true,
      mascota: {
        include: {
          fotos: true
        }
      },
      formulario: true
    },
    orderBy: {
      fecha_solicitud: "desc"
    }
  });
};

export const obtenerSolicitudesUsuario = async (id_usuario) => {
  return await prisma.solicitud_Adopcion.findMany({
    where: {
      id_usuario
    },
    include: {
      mascota: {
        include: {
          fotos: true
        }
      },
      formulario: true
    }
  });
};

export const actualizarSolicitud = async (id, data) => {

  const solicitud =
    await prisma.solicitud_Adopcion.findUnique({
      where: {
        id_solicitud: id
      },
      include: {
        mascota: true
      }
    });

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const actualizada =
    await prisma.solicitud_Adopcion.update({
      where: {
        id_solicitud: id
      },
      data
    });

  // ✅ ACEPTADA
  if (
    data.estado &&
    data.estado.toLowerCase() === "aceptada"
  ) {

    await prisma.mascota.update({
      where: {
        id_mascota: solicitud.id_mascota
      },
      data: {
        estado_adopcion: "No Disponible"
      }
    });

    await crearNotificacion(
      solicitud.id_usuario,
      "🎉 Solicitud aceptada",
      `Tu solicitud para adoptar a ${solicitud.mascota.nombre} fue aceptada.`,
      "ADOPCION"
    );
  }

  // ❌ RECHAZADA
  if (
    data.estado &&
    data.estado.toLowerCase() === "rechazada"
  ) {

    await crearNotificacion(
      solicitud.id_usuario,
      "❌ Solicitud rechazada",
      `Tu solicitud para adoptar a ${solicitud.mascota.nombre} fue rechazada.`,
      "ADOPCION"
    );
  }

  return actualizada;
};

export const eliminarSolicitud = async (id) => {
  return await prisma.$transaction([
    prisma.formulario_Adopcion.deleteMany({
      where: {
        id_solicitud: id
      }
    }),
    prisma.solicitud_Adopcion.delete({
      where: {
        id_solicitud: id
      }
    })
  ]);
};