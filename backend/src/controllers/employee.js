import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Employee } from "../models/employee.js";
import { EMPLOYEE_ROLES } from "../constants/enums.js";

dotenv.config();

export const getEmployee = async (req, res) => {
    try {
        if (!req.employee || !req.employee.id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const employee = await Employee.findByPk(req.employee.id, {
            attributes: ["id", "first_name", "last_name", "email", "phone_number", "role"],
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        return res.status(200).json(employee);

    } catch (error) {
        console.error("Error in getEmployee:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            attributes: ["id", "first_name", "last_name", "email", "phone_number", "role"]
        });
        res.json({ employees });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const { first_name, last_name, email, phone_number, role, password } = req.body;

        if (req.employee.role !== EMPLOYEE_ROLES.ADMIN) {
            return res.status(403).json({ message: "Only administrators can add employees." });
        }

        if (!email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({ message: "All required fields must be filled in." });
        }

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "Email invalid sau lipsește." });
        } else {
            const existing = await Employee.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ message: "Email este deja folosit." });
            }
        }

        if (!phone_number || phone_number.trim().length < 10) {
            return res.status(400).json({ message: "Număr de telefon invalid sau lipsește." });
        } else {
            const existingPhone = await Employee.findOne({ where: { phone_number } });
            if (existingPhone) {
                return res.status(400).json({ message: "Phone number is already in use." });
            }
        }

        const newEmployee = await Employee.create({
            first_name,
            last_name,
            email,
            phone_number,
            role,
            password,
        });

        return res.status(201).json({
            message: "Employee created successfully.",
            employee: {
                id: newEmployee.id,
                first_name,
                last_name,
                email,
                phone_number,
                role,
            },
        });
    } catch (error) {
        console.error("Create employee error:", error);
        return res.status(500).json({ message: "Internal error while creating employee." });
    }
};

export const updateEmployee = async (req, res) => {
    try {
      const employeeId = req.params.id || req.employee?.id;
      const employee = await Employee.findByPk(employeeId);
  
      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }
  
      const isSelf = req.employee.id === employee.id;
      const isAdmin = req.employee.role === EMPLOYEE_ROLES.ADMIN;
  
      if (!isSelf && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to update this employee." });
      }
  
      const { first_name, last_name, email, phone_number, role, password } = req.body;
  
      if (first_name) employee.first_name = first_name.trim();
      if (last_name) employee.last_name = last_name.trim();
  
      if (email && email !== employee.email) {
        const existing = await Employee.findOne({ where: { email } });
        if (existing && existing.id !== employee.id) {
          return res.status(400).json({ message: "Email-ul este deja folosit de alt utilizator." });
        }
        employee.email = email.trim();
      }
  
      if (phone_number && phone_number !== employee.phone_number) {
        const existing = await Employee.findOne({ where: { phone_number } });
        if (existing && existing.id !== employee.id) {
          return res.status(400).json({ message: "Phone number is already used by another account." });
        }
        employee.phone_number = phone_number.trim();
      }
  
      if (role && isAdmin) {
        employee.role = role.trim();
      }
  
      if (password && password.trim() !== "") {
        employee.password = password.trim();
      }
  
      await employee.save();
  
      return res.status(200).json({
        message: "Employee updated successfully.",
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          phone_number: employee.phone_number,
          role: employee.role,
        },
      });
    } catch (error) {
      console.error("Update employee error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };  

export const deleteEmployee = async (req, res) => {
    const targetId = req.params.id;
    const currentUserId = req.employee?.id;

    try {
        if (String(targetId) === String(currentUserId)) {
            return res.status(403).json({ message: "You cannot delete your own account." });
        }

        const employee = await Employee.findByPk(targetId);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        await employee.destroy();
        res.json({ message: "Employee deleted successfully." });
    } catch (err) {
        console.error("Delete employee error:", err);
        return res.status(500).json({ message: "Internal error while deleting employee." });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const employee = await Employee.scope("withPassword").findOne({ where: { email } });

        if (!employee) {
            return res.status(404).json({ message: "Email not found." });
        }

        const isMatch = await employee.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        const token = jwt.sign(
            { id: employee.id, role: employee.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        const { password: _, ...employeeData } = employee.toJSON();
        res.status(200).json({
            message: "Login successful.",
            token,
            employee: employeeData,
        });
    } catch (err) {
        console.error("Login error: ", err);
        res.status(500).json({ message: "Server error." });
    }
};