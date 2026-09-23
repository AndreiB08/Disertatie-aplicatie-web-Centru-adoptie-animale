import express from "express";
import { getPetCareAdvice } from "../controllers/aiAdvice.js";

export const router = express.Router();

router.post("/advice", getPetCareAdvice);
