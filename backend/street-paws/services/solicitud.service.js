import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const crearSolicitud = async (data, formularioData = null) => {
  return await prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitud_Adopcion.create({ data });

    if (formularioData) {
      await tx.formulario_Adopcion.create({
        data: {
          id_solicitud: solicitud.id_solicitud,
          ...formularioData,
        },
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
          fotos: true,
        },
      },
      formulario: true, // ← único include nuevo
    },
    orderBy: {
      fecha_solicitud: "desc",
    },
  });
};

export const obtenerSolicitudesUsuario = async (id_usuario) => {
  return await prisma.solicitud_Adopcion.findMany({
    where: { id_usuario },
    include: {
      mascota: {
        include: {
          fotos: true,
        },
      },
      formulario: true, // ← único include nuevo
    },
  });
};

export const actualizarSolicitud = async (id, data) => {
  return await prisma.solicitud_Adopcion.update({
    where: { id_solicitud: id },
    data,
  });
};

export const eliminarSolicitud = async (id) => {
  return await prisma.$transaction([
    prisma.formulario_Adopcion.deleteMany({ where: { id_solicitud: id } }),
    prisma.solicitud_Adopcion.delete({ where: { id_solicitud: id } }),
  ]);
};
