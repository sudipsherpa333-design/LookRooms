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
  origin: process.env.APP_URL || "*",
  credentials: true
}));
app.use(mongoSanitize());
app.use(xss());

// Redis-backed Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
  }),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

// Standard Middlewares
app.use(morgan("dev"));
app.use(compression());
app.use(express.json({ limit: "10mb" })); // Strict body size limit
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/v1", apiV1);
// Backward compatibility for existing routes
app.use("/api", apiV1);

// Static files (Production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

// Global Error Handler
app.use(errorHandler);

export default app;
