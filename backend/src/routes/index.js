import express from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
} from '../controllers/companiesController.js';
import {
  getAllWorks,
  getWorkById,
  createWork,
  updateWork,
  deleteWork
} from '../controllers/worksController.js';
import {
  getAllLoads,
  getLoadById,
  getLoadsByWork,
  createLoad,
  updateLoad,
  deleteLoad,
  getNextSheetNumber
} from '../controllers/loadsController.js';
import {
  getAllSamples,
  getSampleById,
  getSamplesByLoad,
  createSample,
  createSamplesBulk,
  updateSample,
  deleteSample,
  getNextLabNumber,
  getNextLabNumbers
} from '../controllers/samplesController.js';

const router = express.Router();

// ========== COMPANIES ==========
router.get('/companies', getAllCompanies);
router.get('/companies/:id', getCompanyById);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

// ========== WORKS ==========
router.get('/works', getAllWorks);
router.get('/works/:id', getWorkById);
router.post('/works', createWork);
router.put('/works/:id', updateWork);
router.delete('/works/:id', deleteWork);

// ========== LOADS ==========
router.get('/loads', getAllLoads);
router.get('/loads/:id', getLoadById);
router.get('/loads/work/:obraId', getLoadsByWork);
router.get('/loads/next-sheet-number/:obraId', getNextSheetNumber);
router.post('/loads', createLoad);
router.put('/loads/:id', updateLoad);
router.delete('/loads/:id', deleteLoad);

// ========== SAMPLES ==========
router.get('/samples', getAllSamples);
router.get('/samples/:id', getSampleById);
router.get('/samples/load/:cargaId', getSamplesByLoad);
router.get('/samples/next-lab-number', getNextLabNumber);
router.get('/samples/next-lab-numbers/:count', getNextLabNumbers);
router.post('/samples', createSample);
router.post('/samples/bulk', createSamplesBulk);
router.put('/samples/:id', updateSample);
router.delete('/samples/:id', deleteSample);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    version: '1.0.0'
  });
});

export default router;
