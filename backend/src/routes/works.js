import express from 'express';
import worksController from '../controllers/worksController.js';

const router = express.Router();

// GET /api/works - Listar todas as obras
router.get('/', worksController.getAll);

// GET /api/works/:id - Buscar obra por ID
router.get('/:id', worksController.getById);

// POST /api/works - Criar nova obra
router.post('/', worksController.create);

// PUT /api/works/:id - Atualizar obra
router.put('/:id', worksController.update);

// DELETE /api/works/:id - Deletar obra
router.delete('/:id', worksController.delete);

export default router;