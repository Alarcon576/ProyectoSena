import "dotenv/config"; 
import { cors } from "cors";
console.log("DATABASE_URL:", process.env.DATABASE_URL);
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(3000, () => console.log("Servidor corriendo "));