import express from "express";
import { validate as isUUID } from "uuid";
import * as adoptionController from "../controllers/adoptionRequest.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validateUUIDParam } from "../middleware/validateUUIDParam.js";

export const router = express.Router();

router.param("id", validateUUIDParam("id"));

router.post("/", adoptionController.addAdoptionRequest);
router.get("/", authenticate, authorize(["Admin", "Angajat"]), adoptionController.getAllRequests);
router.delete("/:id", authenticate, authorize(["Admin", "Angajat"]), adoptionController.deleteRequest);
router.put("/:id", authenticate, authorize(["Admin", "Angajat"]), adoptionController.approveRequest);