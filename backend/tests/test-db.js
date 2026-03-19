import mongoose from "mongoose";
import "dotenv/config";

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MONGODB_URI is not set in the environment variables.");
    process.exit(1);
  }
  
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("SUCCESS: Connected to MongoDB successfully!");
    process.exit(0);
  } catch (error) {
    console.error("FAILED: Could not connect to MongoDB.");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
