import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendEmail } from "../services/email.service.js";


const prisma = new PrismaClient(); 
export const register = async (req, res) => {
  try {
    const { nombre, email, contrasena, direccion, telefono } = req.body;

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        contrasena: hash,
        direccion,
        telefono,
        fecha_registro: new Date(),
        id_rol: 1 
      }
    });

    const { contrasena: _, ...userSafe } = user;
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ msg: "Usuario no existe" });

    const valid = await bcrypt.compare(contrasena, user.contrasena);
    if (!valid) return res.status(401).json({ msg: "Credenciales incorrectas" });

    const token = jwt.sign(
      { id: user.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false
    });

    res.json({ msg: "Login exitoso", token });

  } catch (error) {
    res.status(500).json(error);
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logout exitoso" });
};


// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ msg: "No existe usuario" });

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.usuario.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExp: new Date(Date.now() + 3600000)
    }
  });

  const link = `http://localhost:3000/reset-password/${token}`;

  await sendEmail(email, "Recuperar contraseña", `<a href="${link}">Click aquí</a>`);

  res.json({ msg: "Correo enviado" });
};

export const resetPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  const user = await prisma.usuario.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() }
    }
  });

  if (!user) return res.status(400).json({ msg: "Token inválido o expirado" });

  const hash = await bcrypt.hash(nuevaPassword, 10);

  await prisma.usuario.update({
    where: { id_usuario: user.id_usuario },
    data: {
      contrasena: hash,
      resetToken: null,
      resetTokenExp: null
    }
  });

  res.json({ msg: "Contraseña actualizada" });
};