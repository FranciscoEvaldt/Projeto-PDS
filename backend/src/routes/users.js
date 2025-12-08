import express from 'express';
import usersController from '../controllers/usersController.js';

const router = express.Router();

// POST /api/users/authenticate - Autenticar usuário (login)
router.post('/authenticate', usersController.authenticate);

// GET /api/users - Listar todos os usuários
router.get('/', usersController.getAll);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', usersController.getById);

// POST /api/users - Criar novo usuário
router.post('/', usersController.create);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', usersController.update);

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', usersController.delete);

export default router;
