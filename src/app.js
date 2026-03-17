import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";

// import swaggerUiDist from "swagger-ui-dist";
// import swaggerSpec from "./swagger/swagger.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import userSpecialityRoutes from "./routes/user-speciality.routes.js";
import userAvailabilityRoutes from "./routes/user-availability.routes.js";
import userRoutes from "./routes/user.routes.js";
import timeSlotRoutes from "./routes/time-slot.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import trainerRoutes from "./routes/trainer.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import specialityRoutes from "./routes/speciality.routes.js";
import workoutVideoRoutes from "./routes/workout-video.routes.js";
import planRoutes from "./routes/plan.routes.js";
import trainerRequestRoutes from "./routes/trainer-request.routes.js";
import questionnaireRoutes from "./routes/questionnaire.routes.js";
import journalEntryRoutes from "./routes/journal-entry.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import { initChatSocket } from "./sockets/chat.socket.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

initChatSocket(io);

// ---------------------------
// Serverless-safe Swagger UI
// ---------------------------

// 1️⃣ Serve static Swagger UI files
// const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();
// app.use("/api/docs", express.static(swaggerDistPath));

// 2️⃣ Serve Swagger spec JSON
app.get("/api/docs/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

// Optional: redirect /api/docs to index.html
// app.get("/api/docs", (req, res) => {
//   res.sendFile(path.join(swaggerDistPath, "index.html"));
// });

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ---------------------------
// API Routes
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api", healthRoutes);
app.use("/api/user", userSpecialityRoutes);
app.use("/api/user", userAvailabilityRoutes);
app.use("/api", userRoutes);
app.use("/api", timeSlotRoutes);
app.use("/api", bookingRoutes);
app.use("/", trainerRoutes);
app.use("/", customerRoutes);
app.use("/api", specialityRoutes);
app.use("/api", workoutVideoRoutes);
app.use("/api", planRoutes);
app.use("/api", trainerRequestRoutes);
app.use("/api", questionnaireRoutes);
app.use("/api", journalEntryRoutes);
app.use("/api", chatRoutes);



app.use(errorHandler);




export default app;
