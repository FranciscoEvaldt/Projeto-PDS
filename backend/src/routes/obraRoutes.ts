import express from "express";
import { getObras, createObra } from "../controllers/obraController.js";

const router = express.Router();
router.get("/", getObras);
router.post("/", createObra);

export default router;
