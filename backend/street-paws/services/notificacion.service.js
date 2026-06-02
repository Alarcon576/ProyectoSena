import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const crearNotificacion = async (
  id_usuario,
  titulo,
  mensaje,
  tipo
) => {
  return prisma.notificacion.create({
    data: {
      id_usuario,
      titulo,
      mensaje,
      tipo
    }
  });
};

export const obtenerNotificaciones = async (
  id_usuario
) => {
  return prisma.notificacion.findMany({
    where: {
      id_usuario
    },
    orderBy: {
      fecha: "desc"
    }
  });
};

export const marcarLeida = async (id) => {
  return prisma.notificacion.update({
    where: {
      id_notificacion: id
    },
    data: {
      leida: true
    }
  });
};