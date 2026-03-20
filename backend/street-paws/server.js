import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express(); // 🔹 Primero declaramos app

// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/auth", authRoutes);   

// Servidor
app.listen(3000, () => console.log("Servidor corriendo"));