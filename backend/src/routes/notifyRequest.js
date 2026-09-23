import express from "express";
import * as notifyController from "../controllers/notifyRequest.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const router = express.Router();

router.post("/", notifyController.addNotifyRequest);

router.post("/notify-availability", authenticate, authorize(["Admin", "Angajat"]), notifyController.notifyAvailability);
