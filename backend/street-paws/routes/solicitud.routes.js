import { Router } from "express";
import {
  crear,
  listar,
  misSolicitudes,
  actualizar,
  eliminar
} from "../controllers/solicitud.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verificarToken, crear);
router.get("/", verificarToken, listar);
router.get("/mis-solicitudes", verificarToken, misSolicitudes);
router.put("/:id", verificarToken, actualizar);
router.delete("/:id", verificarToken, eliminar);

export default router;