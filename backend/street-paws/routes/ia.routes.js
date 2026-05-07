import { Router } from "express";
import { consultaSalud } from "../controllers/ia.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/salud", verificarToken, consultaSalud);

export default router;