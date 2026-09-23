import express from "express";
import * as employeeController from "../controllers/employee.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validateUUIDParam } from "../middleware/validateUUIDParam.js";

export const router = express.Router();

router.param("id", validateUUIDParam("id"));

router.post("/login", employeeController.login);
router.get("/me", authenticate, employeeController.getEmployee);
router.get("/", authenticate, authorize(["Admin"]), employeeController.getAllEmployees);
router.post("/", authenticate, authorize(["Admin"]), employeeController.createEmployee);
router.put("/me", authenticate, authorize(["Admin", "Angajat"]), employeeController.updateEmployee);
router.put("/:id", authenticate, authorize(["Admin"]), employeeController.updateEmployee);
router.delete("/:id", authenticate, authorize(["Admin"]), employeeController.deleteEmployee);



