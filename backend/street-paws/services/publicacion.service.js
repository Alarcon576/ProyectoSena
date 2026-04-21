import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const crearPublicacion = async (data) => {
  return await prisma.publicacion.create({
    data
  });
};

export const obtenerPublicaciones = async () => {
  return await prisma.publicacion.findMany({
    include: {
      usuario: true,
      comentarios: {
        include: {
          usuario: true
        }
      },
      likes: true,
      imagenes: true
    },
    orderBy: {
      fecha_publicacion: "desc"
    }
  });
};

export const obtenerPublicacionPorId = async (id) => {
  return await prisma.publicacion.findUnique({
    where: { id_publicacion: id },
    include: {
      usuario: true,
      comentarios: {
        include: {
          usuario: true
        }
      },
      likes: true,
      imagenes: true
    }
  });
};

export const actualizarPublicacion = async (id, data) => {
  return await prisma.publicacion.update({
    where: { id_publicacion: id },
    data
  });
};

export const eliminarPublicacion = async (id) => {
  return await prisma.publicacion.delete({
    where: { id_publicacion: id }
  });
};