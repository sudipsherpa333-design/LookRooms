import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "./utils/redis.js";
import apiV1 from "./api/v1/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Custom Winston Request Logger
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Security Middlewares
app.disable('x-powered-by'); // Hide Express
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.APP_URL || "*",
  credentials: true
}));
app.use(mongoSanitize());
app.use(xss());

// Redis-backed Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  store: redis ? new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
  }) : undefined,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
});
app.use("/api/", globalLimiter);

// Standard Middlewares
app.use(morgan("dev"));
app.use(compression());
app.use(express.json({ limit: "10mb" })); // Strict body size limit
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Middleware to ensure DB is connected before handling API requests
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database connection is not established. Please try again in a few seconds.",
      readyState: mongoose.connection.readyState
    });
  }
  next();
});

// API Routes
app.use("/api/v1", apiV1);
// Backward compatibility for existing routes
app.use("/api", apiV1);

// Handle API 404s
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Global Error Handler
app.use(errorHandler);

export default app;
