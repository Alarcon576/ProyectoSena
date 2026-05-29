import express from "express";
import { obtenerNoticias } from "../controllers/noticia.controller.js";

const router = express.Router();

router.get("/", obtenerNoticias);

export default router;