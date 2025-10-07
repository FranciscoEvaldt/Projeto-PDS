import express from "express";
import { getAmostras, createAmostra } from "../controllers/amostraController.js";

const router = express.Router();
router.get("/", getAmostras);
router.post("/", createAmostra);

export default router;
