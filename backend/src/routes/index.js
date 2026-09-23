import express from "express";
import { router as employeeRouter } from "./employee.js";
import { router as animalRouter } from "./animal.js";
import { router as adoptionRouter } from "./adoptionRequest.js";
import { router as notifyRouter } from "./notifyRequest.js";
import { router as statisticsRouter } from "./statistics.js";
import { router as contactRouter } from "./contact.js";
import {router as aiAdviceRouter } from "./aiAdvice.js";

export const router = express.Router();

router.get("/", (req, res, next) => {
    res.status(200).json({ message: "API is running" });
    next();
});

router.use("/employees", employeeRouter);
router.use("/pets", animalRouter);
router.use("/adoption-requests", adoptionRouter);
router.use("/notify-requests", notifyRouter);
router.use("/stats", statisticsRouter);
router.use("/contact", contactRouter);
router.use("/api/ai", aiAdviceRouter);

router.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({ message: "Internal server error" });
});