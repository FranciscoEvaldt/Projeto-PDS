import express from "express";
import usersController from "../controllers/usersController.js";

const router = express.Router();

router.post("/authenticate", usersController.authenticate);

router.get("/", usersController.getAll);

router.get("/:id", usersController.getById);

router.post("/", usersController.create);

router.put("/:id", usersController.update);

router.delete("/:id", usersController.delete);

export default router;
