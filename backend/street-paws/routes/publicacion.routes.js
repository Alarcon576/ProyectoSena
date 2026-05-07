import { Router } from "express";
import {
  crear,
  listar,
  obtener,
  actualizar,
  eliminar
} from "../controllers/publicacion.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", listar);
router.get("/:id", obtener);

router.post("/", verificarToken, upload.single("imagen"), crear);
router.put("/:id", verificarToken, upload.single("imagen"), actualizar);
router.delete("/:id", verificarToken, eliminar);

export default router;