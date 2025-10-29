import express from "express";
import { gerarRelatorioPDF } from "../controllers/relatorioController.js";

const router = express.Router();
router.get("/:carga_id", gerarRelatorioPDF);

export default router;
