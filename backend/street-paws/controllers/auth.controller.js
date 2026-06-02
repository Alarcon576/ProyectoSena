import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { enviarCorreoRecuperacion as sendEmail } from "../services/email.service.js";
const prisma = new PrismaClient();

// ========================
// REGISTER
// ========================

export const register = async (req, res) => {
  try {
    const {
      nombre,
      email,
      contrasena,
      direccion,
      telefono
    } = req.body;

    const existe = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existe) {
      return res.status(400).json({
        msg: "El usuario ya existe"
      });
    }

    const hash = await bcrypt.hash(
      contrasena,
      10
    );

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

    const {
      contrasena: _,
      ...userSafe
    } = user;

    res.status(201).json(userSafe);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      msg: "Error registrando usuario"
    });

  }
};

// ========================
// LOGIN
// ========================

export const login = async (req, res) => {
  try {

    const {
      email,
      contrasena
    } = req.body;

    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no existe"
      });
    }

    const valid = await bcrypt.compare(
      contrasena,
      user.contrasena
    );

    if (!valid) {
      return res.status(401).json({
        msg: "Credenciales incorrectas"
      });
    }

    const token = jwt.sign(
      {
        id: user.id_usuario,
        rol: user.id_rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "7d"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false
    });

    res.json({
      msg: "Login exitoso",
      token
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      msg: "Error iniciando sesión"
    });

  }
};

// ========================
// LOGOUT
// ========================

export const logout = (req, res) => {

  res.clearCookie("token");

  res.json({
    msg: "Logout exitoso"
  });

};

// ========================
// FORGOT PASSWORD
// ========================

export const forgotPassword = async (
  req,
  res
) => {
  try {

    const { email } = req.body;

    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        msg: "No existe usuario con ese correo"
      });
    }

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    await prisma.usuario.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExp: new Date(
          Date.now() + 60 * 60 * 1000
        )
      }
    });

    const link =
      `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendEmail(
      email,
      "Recuperar contraseña - Street Paws",
      `
      <div style="font-family: Arial, sans-serif;">
        <h2>🐾 Street Paws</h2>

        <p>
          Hemos recibido una solicitud para recuperar tu contraseña.
        </p>

        <p>
          Haz clic en el siguiente botón:
        </p>

        <a
          href="${link}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#f29933;
            color:white;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Recuperar contraseña
        </a>

        <p>
          Este enlace expirará en 1 hora.
        </p>

        <p>
          Si no realizaste esta solicitud,
          puedes ignorar este mensaje.
        </p>
      </div>
      `
    );

    res.json({
      msg: "Correo de recuperación enviado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      msg: "Error enviando correo"
    });

  }
};

// ========================
// RESET PASSWORD
// ========================

export const resetPassword = async (
  req,
  res
) => {
  try {

    const {
      token,
      nuevaPassword
    } = req.body;

    if (
      !nuevaPassword ||
      nuevaPassword.length < 6
    ) {
      return res.status(400).json({
        msg:
          "La contraseña debe tener mínimo 6 caracteres"
      });
    }

    const user =
      await prisma.usuario.findFirst({
        where: {
          resetToken: token,
          resetTokenExp: {
            gt: new Date()
          }
        }
      });

    if (!user) {
      return res.status(400).json({
        msg:
          "Token inválido o expirado"
      });
    }

    const hash = await bcrypt.hash(
      nuevaPassword,
      10
    );

    await prisma.usuario.update({
      where: {
        id_usuario:
          user.id_usuario
      },
      data: {
        contrasena: hash,
        resetToken: null,
        resetTokenExp: null
      }
    });

    res.json({
      msg:
        "Contraseña actualizada correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      msg:
        "Error actualizando contraseña"
    });

  }
};