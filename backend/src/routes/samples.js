import express from "express";
import samplesController from "../controllers/samplesController.js";

const router = express.Router();

router.get("/", samplesController.getAll);

router.get("/:id", samplesController.getById);

router.post("/", samplesController.create);

router.post("/bulk", samplesController.createBulk);

router.put("/:id", samplesController.update);

router.delete("/:id", samplesController.delete);

export default router;
