import express from "express";
import { getStatistics } from "../controllers/statistics.js";

export const router = express.Router();

router.get("/", getStatistics);
