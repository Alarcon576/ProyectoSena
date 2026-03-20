import express from 'express';
import {
  crear,
  listar,
  obtener,
  actualizar,
  eliminar
} from '../controllers/mascota.controller.js';

const router = express.Router();

router.post('/', crear);
router.get('/', listar);
router.get('/:id', obtener);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

export default router;