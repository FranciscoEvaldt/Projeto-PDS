import express from 'express';
import companiesController from '../controllers/companiesController.js';

const router = express.Router();

// GET /api/companies - Listar todas as empresas
router.get('/', companiesController.getAll);

// GET /api/companies/:id - Buscar empresa por ID
router.get('/:id', companiesController.getById);

// POST /api/companies - Criar nova empresa
router.post('/', companiesController.create);

// PUT /api/companies/:id - Atualizar empresa
router.put('/:id', companiesController.update);

// DELETE /api/companies/:id - Deletar empresa
router.delete('/:id', companiesController.delete);

export default router;