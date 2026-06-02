import { Router } from "express";

import {
  listar,
  leer
} from "../controllers/notificacion.controller.js";

import {
  verificarToken
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  verificarToken,
  listar
);

router.put(
  "/:id/leida",
  verificarToken,
  leer
);

export default router;