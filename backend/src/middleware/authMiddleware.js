import { getAuth } from "firebase-admin/auth";
import { db } from "../config/firebase.js";

const adminAuth = getAuth();

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verificăm token-ul emis de Firebase Authentication
        const decodedToken = await adminAuth.verifyIdToken(token);

        // UID-ul Firebase devine ID-ul angajatului
        const employeeId = decodedToken.uid;

        // Luăm rolul și datele angajatului din Firestore
        const employeeDoc = await db
            .collection("employees")
            .doc(employeeId)
            .get();

        if (!employeeDoc.exists) {
            return res.status(404).json({
                message: "Employee profile not found."
            });
        }

        const employeeData = employeeDoc.data();

        req.employee = {
            id: employeeId,
            email: decodedToken.email,
            role: employeeData.role,
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            mustChangePassword: employeeData.mustChangePassword ?? false
        };

        next();

    } catch (error) {
        console.error("Firebase Authentication Error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired authentication token."
        });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.employee) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        if (!roles.includes(req.employee.role)) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
    };
};