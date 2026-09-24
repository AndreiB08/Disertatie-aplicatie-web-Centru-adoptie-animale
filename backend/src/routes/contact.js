import express from "express";
import * as contactController from "../controllers/contact.js";

export const router = express.Router();

router.get("/", contactController.getContacts);
router.post("/", contactController.addContact);
router.delete("/:id", contactController.deleteContact);
