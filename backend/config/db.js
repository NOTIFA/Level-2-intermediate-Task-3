const mongoose = require("mongoose");

// Reasonable defaults for query/document validation and timeouts.
mongoose.set("strictQuery", true);

/**
 * Connects to MongoDB using MONGODB_URI from the environment.
 * Called once, before the Express server starts listening, so that no
 * request is ever handled without a working database connection.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and configure it.");
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
