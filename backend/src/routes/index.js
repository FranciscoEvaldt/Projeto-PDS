import express from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import companyController from '../controllers/companyController.js';
import workController from '../controllers/workController.js';
import loadController from '../controllers/loadController.js';
import sampleController from '../controllers/sampleController.js';
import { authMiddleware, adminMiddleware, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ============= ROTAS PÚBLICAS =============

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============= AUTENTICAÇÃO =============

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authMiddleware, authController.me);

// ============= USUÁRIOS (Admin apenas) =============

router.get('/users', authMiddleware, adminMiddleware, userController.getAll);
router.get('/users/:id', authMiddleware, userController.getById);
router.post('/users', authMiddleware, adminMiddleware, userController.create);
router.put('/users/:id', authMiddleware, userController.update);
router.put('/users/:id/password', authMiddleware, userController.updatePassword);
router.delete('/users/:id', authMiddleware, adminMiddleware, userController.delete);

// ============= EMPRESAS =============

// Usar optionalAuth para permitir acesso com ou sem autenticação
router.get('/companies', optionalAuth, companyController.getAll);
router.get('/companies/with-work-count', optionalAuth, companyController.getAllWithWorkCount);
router.get('/companies/:id', optionalAuth, companyController.getById);
router.post('/companies', optionalAuth, companyController.create);
router.put('/companies/:id', optionalAuth, companyController.update);
router.delete('/companies/:id', optionalAuth, companyController.delete);

// ============= OBRAS =============

router.get('/works', optionalAuth, workController.getAll);
router.get('/works/with-counts', optionalAuth, workController.getAllWithCounts);
router.get('/works/:id', optionalAuth, workController.getById);
router.get('/works/company/:companyId', optionalAuth, workController.getByCompany);
router.post('/works', optionalAuth, workController.create);
router.put('/works/:id', optionalAuth, workController.update);
router.delete('/works/:id', optionalAuth, workController.delete);

// ============= CARGAS/PLANILHAS =============

router.get('/loads', optionalAuth, loadController.getAll);
router.get('/loads/with-details', optionalAuth, loadController.getAllWithDetails);
router.get('/loads/:id', optionalAuth, loadController.getById);
router.get('/loads/work/:workId', optionalAuth, loadController.getByWork);
router.post('/loads', optionalAuth, loadController.create);
router.put('/loads/:id', optionalAuth, loadController.update);
router.delete('/loads/:id', optionalAuth, loadController.delete);

// ============= AMOSTRAS =============

router.get('/samples', optionalAuth, sampleController.getAll);
router.get('/samples/with-details', optionalAuth, sampleController.getAllWithDetails);
router.get('/samples/:id', optionalAuth, sampleController.getById);
router.get('/samples/load/:loadId', optionalAuth, sampleController.getByLoad);
router.get('/samples/work/:workId', optionalAuth, sampleController.getByWork);
router.get('/samples/status/:status', optionalAuth, sampleController.getByStatus);
router.post('/samples', optionalAuth, sampleController.create);
router.put('/samples/:id', optionalAuth, sampleController.update);
router.put('/samples/:id/result', optionalAuth, sampleController.updateResult);
router.delete('/samples/:id', optionalAuth, sampleController.delete);

export default router;
