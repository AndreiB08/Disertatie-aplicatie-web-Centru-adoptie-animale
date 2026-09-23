import express from "express";
import multer from "multer";
import * as animalController from "../controllers/animal.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validateUUIDParam } from "../middleware/validateUUIDParam.js";

export const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/octet-stream"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG and WEBP images are allowed."));
        }
    }
});

router.param("id", validateUUIDParam("id"));

router.get("/", animalController.getAnimals);
router.get("/:id", animalController.getAnimalById);

router.post(
    "/",
    authenticate,
    authorize(["Admin", "Angajat"]),
    upload.single("image"),
    animalController.addAnimal
);

router.put(
    "/:id",
    authenticate,
    authorize(["Admin", "Angajat"]),
    upload.single("image"),
    animalController.updateAnimal
);

router.delete(
    "/:id",
    authenticate,
    authorize(["Admin", "Angajat"]),
    animalController.deleteAnimal
);