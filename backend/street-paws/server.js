import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import publicacionRoutes from "./routes/publicacion.routes.js";
import authRoutes from "./routes/auth.routes.js";
import mascotaRoutes from "./routes/mascota.routes.js";
import interaccionRoutes from "./routes/interaccion.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import iaRoutes from "./routes/ia.routes.js";
import solicitudRoutes from "./routes/solicitud.routes.js";
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();

// 🔹 Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 🔹 Ruta de prueba
app.get("/", (req, res) => {
    res.send("API funcionando ");
});

// 🔹 Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/mascotas", mascotaRoutes);
app.use("/api/publicaciones", publicacionRoutes);
app.use("/api/interacciones", interaccionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/solicitudes", solicitudRoutes);
// 🔹 Puerto (mejor usar variable de entorno)
const PORT = process.env.PORT || 3000;

// 🔹 Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});