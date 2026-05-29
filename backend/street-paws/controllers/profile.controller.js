import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";   
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
// Actualizar datos del perfil (nombre, telefono, direccion)
export const actualizarPerfil = async (req, res) => {
  try {
    const id = req.user.id;
    const { nombre, telefono, direccion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ msg: "El nombre es obligatorio" });
    }
    if (!telefono || !/^\d{7,15}$/.test(telefono.trim())) {
      return res.status(400).json({ msg: "Telefono invalido (7 a 15 digitos)" });
    }

    const usuario = await prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: (direccion || "").trim(),
      },
    });

    res.json({ msg: "Perfil actualizado", usuario });
  } catch (error) {
    console.error("ERROR ACTUALIZAR PERFIL:", error);
    res.status(500).json({ msg: "No se pudo actualizar el perfil" });
  }
};


export const cambiarPassword = async (req, res) => {
  try {
    const id = req.user.id;
    const { contrasena_actual, contrasena_nueva } = req.body;

    if (!contrasena_actual || !contrasena_nueva) {
      return res.status(400).json({ msg: "Faltan datos" });
    }
    if (contrasena_nueva.length < 8) {
      return res.status(400).json({ msg: "La nueva contrasena debe tener minimo 8 caracteres" });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    const coincide = await bcrypt.compare(contrasena_actual, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ msg: "La contrasena actual es incorrecta" });
    }

    const nuevoHash = await bcrypt.hash(contrasena_nueva, 10);
    await prisma.usuario.update({
      where: { id_usuario: id },
      data: { contrasena: nuevoHash },
    });

    res.json({ msg: "Contrasena actualizada" });
  } catch (error) {
    console.error("ERROR CAMBIAR PASSWORD:", error);
    res.status(500).json({ msg: "No se pudo cambiar la contrasena" });
  }
};