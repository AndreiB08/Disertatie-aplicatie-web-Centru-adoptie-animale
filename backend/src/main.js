import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/firebase.js";
import { checkAdoptionReminders } from "./services/adoptionReminder.js";
import { router as indexRouter } from "./routes/index.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://centru-adoptie-animale.vercel.app",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/", indexRouter);

console.log("Starting server...");

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}...`);

    checkAdoptionReminders();

    setInterval(checkAdoptionReminders, 60 * 1000);
});
