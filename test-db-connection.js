import mongoose from 'mongoose';

const uri = "mongodb+srv://sudipsherpa333_db_user:hiMLJK6biQK32SMv@cluster0.jjwwgox.mongodb.net/lookrooms?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("SUCCESS: Connected to MongoDB successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("ERROR: Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

test();
