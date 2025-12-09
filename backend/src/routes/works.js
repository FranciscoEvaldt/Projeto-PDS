import express from "express";
import worksController from "../controllers/worksController.js";

const router = express.Router();

router.get("/", worksController.getAll);

router.get("/:id", worksController.getById);

router.post("/", worksController.create);

router.put("/:id", worksController.update);

router.delete("/:id", worksController.delete);

export default router;
