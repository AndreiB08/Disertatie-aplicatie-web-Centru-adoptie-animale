import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.employee = decoded;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.employee) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { role } = req.employee;

        if (!roles.includes(role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }

        next();
    };
};
