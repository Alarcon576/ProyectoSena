import { Router } from "express";
import {
  toggleLike,
  crearComentario
} from "../controllers/interaccion.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/like/:id", verificarToken, toggleLike);
router.post("/comentario/:id", verificarToken, crearComentario);

export default router;