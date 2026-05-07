import { Router } from "express";
import {
  actualizarFotoPerfil,
  obtenerMiPerfil,
  obtenerPerfilPorId,
  actualizarPerfil // 👈 IMPORTANTE
} from "../controllers/profile.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// 📸 foto
router.put(
  "/foto",
  verificarToken,
  upload.single("foto"),
  actualizarFotoPerfil
);

// 👤 mi perfil
router.get("/me", verificarToken, obtenerMiPerfil);

// 👤 perfil público
router.get("/:id", verificarToken, obtenerPerfilPorId);

// ✏️ ACTUALIZAR PERFIL 
router.put("/", verificarToken, actualizarPerfil);

export default router;