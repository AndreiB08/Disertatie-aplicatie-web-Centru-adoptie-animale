import express from "express";
import { validate as isUUID } from "uuid";
import * as contactController from "../controllers/contact.js";
import { validateUUIDParam } from "../middleware/validateUUIDParam.js";

export const router = express.Router();

router.param("id", validateUUIDParam("id"));

router.get("/", contactController.getContacts);
router.post("/", contactController.addContact);
router.delete("/:id", contactController.deleteContact);
