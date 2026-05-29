import { Router } from "express";

import {
  actualizarFotoPerfil,
  obtenerMiPerfil,
  obtenerPerfilPorId,
  actualizarPerfil,
  cambiarPassword
} from "../controllers/profile.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// ==========================
// PERFIL PROPIO
// ==========================

router.get(
  "/me",
  verificarToken,
  obtenerMiPerfil
);

router.put(
  "/me",
  verificarToken,
  actualizarPerfil
);

// ==========================
// PASSWORD
// ==========================

router.put(
  "/password",
  verificarToken,
  cambiarPassword
);

// ==========================
// FOTO PERFIL
// ==========================

router.put(
  "/foto",
  verificarToken,
  upload.single("foto"),
  actualizarFotoPerfil
);

// ==========================
// PERFIL PUBLICO
// ==========================

router.get(
  "/:id",
  verificarToken,
  obtenerPerfilPorId
);

export default router;