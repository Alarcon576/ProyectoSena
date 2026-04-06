import { Router } from "express";
import {
  toggleLike,
  crearComentario,
  actualizarComentario,
  eliminarComentario
} from "../controllers/interaccion.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/like/:id", verificarToken, toggleLike);
router.post("/comentario/:id", verificarToken, crearComentario);

router.put("/comentario/:id", verificarToken, actualizarComentario);
router.delete("/comentario/:id", verificarToken, eliminarComentario);

export default router;