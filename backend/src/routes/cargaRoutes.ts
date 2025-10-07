import express from "express";
import { getCargas, createCarga } from "../controllers/cargaController.js";

const router = express.Router();
router.get("/", getCargas);
router.post("/", createCarga);

export default router;
