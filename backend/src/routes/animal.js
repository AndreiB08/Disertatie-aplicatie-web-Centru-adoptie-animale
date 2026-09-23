import express from "express";
import { validate as isUUID } from "uuid";
import * as animalController from "../controllers/animal.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validateUUIDParam } from "../middleware/validateUUIDParam.js";

export const router = express.Router();

router.param("id", validateUUIDParam("id"));

router.get("/", animalController.getAnimals);
router.get("/:id", animalController.getAnimalById);

router.post("/", authenticate, authorize(["Admin", "Angajat"]), animalController.addAnimal);
router.put("/:id", animalController.updateAnimal);
router.delete("/:id", authenticate, authorize(["Admin", "Angajat"]), animalController.deleteAnimal);
