import express from 'express';
import samplesController from '../controllers/samplesController.js';

const router = express.Router();

// GET /api/samples - Listar todas as amostras
router.get('/', samplesController.getAll);

// GET /api/samples/:id - Buscar amostra por ID
router.get('/:id', samplesController.getById);

// POST /api/samples - Criar nova amostra
router.post('/', samplesController.create);

// POST /api/samples/bulk - Criar múltiplas amostras de uma vez
router.post('/bulk', samplesController.createBulk);

// PUT /api/samples/:id - Atualizar amostra
router.put('/:id', samplesController.update);

// DELETE /api/samples/:id - Deletar amostra
router.delete('/:id', samplesController.delete);

export default router;