import express from "express";
import loadsController from "../controllers/loadsController.js";

const router = express.Router();

router.get("/", loadsController.getAll);

router.get("/:id", loadsController.getById);

router.post("/", loadsController.create);

router.put("/:id", loadsController.update);

router.delete("/:id", loadsController.delete);

export default router;
