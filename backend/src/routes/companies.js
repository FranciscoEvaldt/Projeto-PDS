import express from "express";
import companiesController from "../controllers/companiesController.js";

const router = express.Router();

router.get("/", companiesController.getAll);

router.get("/:id", companiesController.getById);

router.post("/", companiesController.create);

router.put("/:id", companiesController.update);

router.delete("/:id", companiesController.delete);

export default router;
