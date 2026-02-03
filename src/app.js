import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerUiDist from "swagger-ui-dist";
import swaggerSpec from "./swagger/swagger.js";

import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve Swagger UI static files directly (Vercel-safe)
const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();
app.use("/api/docs", express.static(swaggerDistPath));

// Serve Swagger spec JSON
app.get("/api/docs/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

app.use("/api/auth", authRoutes);
app.use("/api", healthRoutes);

export default app;
