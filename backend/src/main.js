import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/firebase.js";
import { synchronizeDatabase } from "./config/database.js";
import { router as indexRouter } from "./routes/index.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/", indexRouter);

const startServer = async () => {
    try {
        console.log("Starting server...");

        await synchronizeDatabase();
        console.log("Database synchronized successfully.");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}...`);
        });

    } catch (err) {
        console.error("Database startup error:", err);
        process.exit(1);
    }
};

startServer();
