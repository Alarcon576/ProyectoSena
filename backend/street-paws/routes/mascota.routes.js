import express from 'express';
import {
  crear,
  listar,
  obtener,
  actualizar,
  eliminar
} from '../controllers/mascota.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import { soloAdmin } from '../middlewares/role.middleware.js';
import { upload } from "../middlewares/upload.middleware.js";


const router = express.Router();

// 🔓 Públicas
router.get('/', listar);
router.get('/:id', obtener);

// 🔐 Solo usuarios autenticados
router.post('/', verificarToken, soloAdmin,upload.single("foto"), crear);

// 🔐 Solo admin
router.put('/:id', verificarToken, soloAdmin, upload.single("foto"), actualizar);
router.delete('/:id', verificarToken, soloAdmin, upload.single("foto"), eliminar);

export default router;