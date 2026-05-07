import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Crear mascota
export const crearMascota = async (data) => {
  return await prisma.mascota.create({
    data
  });
};

// Obtener todas
export const obtenerMascotas = async () => {
  return await prisma.mascota.findMany({
    include: {
      fotos: true,
      solicitudes: true
    }
  });
};

// Obtener por ID
export const obtenerMascotaPorId = async (id) => {
  return await prisma.mascota.findUnique({
    where: { id_mascota: id },
    include: {
      fotos: true,
      solicitudes: true
    }
  });
};

// Actualizar
export const actualizarMascota = async (id, data) => {
  return await prisma.mascota.update({
    where: { id_mascota: id },
    data
  });
};

// 🔥 ELIMINAR (ARREGLADO)
export const eliminarMascota = async (id) => {

  // 1️⃣ eliminar fotos relacionadas
  await prisma.foto_Mascota.deleteMany({
    where: { id_mascota: id }
  });

  // 2️⃣ eliminar solicitudes (IMPORTANTE también)
  await prisma.solicitud_Adopcion.deleteMany({
    where: { id_mascota: id }
  });

  // 3️⃣ eliminar mascota
  return await prisma.mascota.delete({
    where: { id_mascota: id }
  });
};