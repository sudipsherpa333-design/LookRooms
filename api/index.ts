import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cron from "node-cron";
import app from "../server/app.js";
import { setIo } from "../server/utils/socketEmitter.js";
import { setupCronJobs } from "../server/jobs/bookingJobs.js";
import { cleanupExpiredLocks } from "../server/services/paymentService.js";
import { User, Message, Conversation, Notification as NotificationModel } from "../server/models/index.js";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import path from "path";

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  if (!process.env.VERCEL) process.exit(1);
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sudipsherpa333_db_user:sudip981331@cluster0.jjwwgox.mongodb.net/lookrooms?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("CRITICAL: MONGODB_URI and JWT_SECRET must be set in environment variables.");
  if (!process.env.VERCEL) process.exit(1);
}

let httpServer: ReturnType<typeof createServer>;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  setIo(io);

  // MongoDB Connection
  const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
      console.log("Attempting to connect to MongoDB...");
      try {
        await mongoose.connect(MONGODB_URI, {
          maxPoolSize: 50,
          wtimeoutMS: 2500,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log("Connected to MongoDB (Enterprise Ready)");
        
        // Cron Jobs (Skip on Vercel)
        if (!process.env.VERCEL) {
          cron.schedule('*/5 * * * *', cleanupExpiredLocks);
          setupCronJobs();
        }
      } catch (err) {
        console.error("MongoDB connection error:", err);
        if (!process.env.VERCEL) process.exit(1);
      }
    }
  };

  await connectDB();

  // Middleware to ensure DB is connected
  app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection is not established. Please try again in a few seconds.",
        readyState: mongoose.connection.readyState
      });
    }
    next();
  });

  // Socket.io Logic (Skip on Vercel)
  if (!process.env.VERCEL) {
    const userSockets = new Map<string, Set<string>>();

    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        socket.data.userId = decoded.userId || decoded.id;
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    });

    io.on("connection", async (socket) => {
      const userId = socket.data.userId;
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId)?.add(socket.id);
      
      await User.findByIdAndUpdate(userId, { isOnline: true }, {});
      io.emit("getOnlineUsers", Array.from(userSockets.keys()));

      // Missed notifications
      const missedNotifications = await (NotificationModel as any).find({ userId, 'channels.inApp.sent': false });
      for (const n of missedNotifications) {
        socket.emit('notification', n);
        await NotificationModel.findByIdAndUpdate(n._id, { 'channels.inApp.sent': true, 'channels.inApp.deliveredAt': new Date() }, {});
      }

      socket.on("joinRoom", (conversationId) => socket.join(conversationId));
      socket.on("sendMessage", async (data) => {
        try {
          const { conversationId, text, image, messageType, fileUrl, fileName, fileSize, audioUrl, audioDuration } = data;
          const message = new Message({
            conversationId, sender: userId, text, image,
            messageType: messageType || "text",
            fileUrl, fileName, fileSize, audioUrl, audioDuration,
            readBy: [userId], deliveredTo: [userId]
          });
          await message.save();
          await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() }, {});
          const populatedMessage = await (Message.findById(message._id) as any).populate("sender", "name avatar");
          io.to(conversationId).emit("newMessage", populatedMessage);
        } catch (error) {
          console.error("Socket error:", error);
        }
      });

      socket.on("disconnect", async () => {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
            await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }, {});
          }
        }
        io.emit("getOnlineUsers", Array.from(userSockets.keys()));
      });
    });
  }

  if (!process.env.VERCEL) {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down gracefully...");
  console.error(err.name, err.message, err.stack);
  if (httpServer) {
    httpServer.close(() => {
      if (!process.env.VERCEL) process.exit(1);
    });
  } else {
    if (!process.env.VERCEL) process.exit(1);
  }
});
