import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/firebase.js";
import { router as indexRouter } from "./routes/index.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const app = express();

app.use(cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/", indexRouter);

console.log("Starting server...");

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}...`);
});
