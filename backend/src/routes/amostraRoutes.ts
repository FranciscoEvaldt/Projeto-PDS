import express from "express";
import {
  getAmostras,
  createAmostra,
  gerarAmostrasAutomaticas,
  registrarRompimento,
} from "../controllers/amostraController.js";

const router = express.Router();

router.get("/", getAmostras);
router.post("/", createAmostra);
router.post("/gerar", gerarAmostrasAutomaticas);
router.put("/romper", registrarRompimento);

export default router;
