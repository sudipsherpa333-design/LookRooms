import express from "express";
import cors from "cors";
import app from "./server/app.js";
import mongoose from "mongoose";
import "dotenv/config";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://sudipsherpa333_db_user:sudip981331@cluster0.jjwwgox.mongodb.net/lookrooms?retryWrites=true&w=majority&appName=Cluster0";

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("Backend API running 🚀");
});

// MongoDB Connection and Server Start
const startServer = async () => {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
    }
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  }
};

startServer();

