import express from 'express';
import loadsController from '../controllers/loadsController.js';

const router = express.Router();

// GET /api/loads - Listar todas as cargas
router.get('/', loadsController.getAll);

// GET /api/loads/:id - Buscar carga por ID
router.get('/:id', loadsController.getById);

// POST /api/loads - Criar nova carga
router.post('/', loadsController.create);

// PUT /api/loads/:id - Atualizar carga
router.put('/:id', loadsController.update);

// DELETE /api/loads/:id - Deletar carga
router.delete('/:id', loadsController.delete);

export default router;