import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const actualizarFotoPerfil = async (req, res) => {
  try {

    const id = req.user.id;

    const usuario = await prisma.usuario.update({
      where: {
        id_usuario: id
      },
      data: {
        foto_perfil: req.file.path
      }
    });

    res.json(usuario);

  } catch (error) {

    console.error("ERROR FOTO PERFIL:", error);

    res.status(500).json({
      error: error.message
    });

  }
};

export const obtenerMiPerfil = async (req, res) => {
  try {

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: req.user.id
      }
    });

    res.json(usuario);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};

export const obtenerPerfilPorId = async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: id
      },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        foto_perfil: true
      }
    });

    if (!usuario) {
      return res.status(404).json({
        msg: "Usuario no encontrado"
      });
    }

    res.json(usuario);

  } catch (error) {

    console.error("Error perfil público:", error);

    res.status(500).json({
      msg: "Error servidor"
    });

  }
};

// ==========================
// ACTUALIZAR PERFIL
// ==========================

export const actualizarPerfil = async (req, res) => {
  try {

    const usuario = await prisma.usuario.update({
      where: {
        id_usuario: req.user.id
      },
      data: {
        nombre: req.body.nombre,
        telefono: req.body.telefono,
        direccion: req.body.direccion
      }
    });

    res.json(usuario);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
};

// ==========================
// CAMBIAR PASSWORD
// ==========================

export const cambiarPassword = async (req, res) => {
  try {

    const {
      contrasena_actual,
      contrasena_nueva
    } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: req.user.id
      }
    });

    const coincide = await bcrypt.compare(
      contrasena_actual,
      usuario.contrasena
    );

    if (!coincide) {
      return res.status(400).json({
        error: "Contraseña actual incorrecta"
      });
    }

    const hashNueva = await bcrypt.hash(
      contrasena_nueva,
      10
    );

    await prisma.usuario.update({
      where: {
        id_usuario: req.user.id
      },
      data: {
        contrasena: hashNueva
      }
    });

    res.json({
      mensaje: "Contraseña actualizada correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
};