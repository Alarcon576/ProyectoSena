import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const crearSolicitud = async (data) => {
  return await prisma.solicitud_Adopcion.create({
    data
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
      }
    },
    orderBy: {
      fecha_solicitud: "desc"
    }
  });
};

export const obtenerSolicitudesUsuario = async (id_usuario) => {
  return await prisma.solicitud_Adopcion.findMany({
    where: { id_usuario },
    include: {
      mascota: {
        include: {
          fotos: true
        }
      }
    }
  });
};

export const actualizarSolicitud = async (id, data) => {
  return await prisma.solicitud_Adopcion.update({
    where: { id_solicitud: id },
    data
  });
};

export const eliminarSolicitud = async (id) => {
  return await prisma.solicitud_Adopcion.delete({
    where: { id_solicitud: id }
  });
};