import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const actualizarFotoPerfil = async (req, res) => {
  try {
    console.log("USER:", req.user);
    console.log("FILE:", req.file);

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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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

export const actualizarPerfil = async (req, res) => {
  try {
    const id = req.user.id;
    const { nombre, email, contrasena } = req.body;

    const data = {};

    if (nombre) data.nombre = nombre;
    if (email) data.email = email;

    
    if (contrasena) {
  const hash = await bcrypt.hash(contrasena, 10);
  data.contrasena = hash;
}

    const usuario = await prisma.usuario.update({
      where: { id_usuario: id },
      data
    });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};