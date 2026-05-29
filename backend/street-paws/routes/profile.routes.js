import { Router } from "express";
import { actualizarFotoPerfil } from "../controllers/profile.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { obtenerMiPerfil } from "../controllers/profile.controller.js";
import { obtenerPerfilPorId } from "../controllers/profile.controller.js";
const router = Router();

router.put(
  "/foto",
  verificarToken,
  upload.single("foto"),
  actualizarFotoPerfil
);
router.get("/me", verificarToken, obtenerMiPerfil);
router.get("/:id", verificarToken, obtenerPerfilPorId);
export default router;