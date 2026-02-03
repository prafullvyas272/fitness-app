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

// Middlewares
app.use(cors());
app.use(express.json());

// ---------------------------
// Serverless-safe Swagger UI
// ---------------------------

// 1️⃣ Serve static Swagger UI files
const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();
app.use("/api/docs", express.static(swaggerDistPath));

// 2️⃣ Serve Swagger spec JSON
app.get("/api/docs/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

// Optional: redirect /api/docs to index.html
app.get("/api/docs", (req, res) => {
  res.sendFile(path.join(swaggerDistPath, "index.html"));
});

// ---------------------------
// API Routes
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api", healthRoutes);

// ---------------------------
// Export app for serverless (Vercel)
// ---------------------------
export default app;
