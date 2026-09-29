import mongoose from "mongoose";
import logger from "./logger.js";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
      });
      logger.info("MongoDB connected");
      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        logger.fatal("All MongoDB connection attempts exhausted");
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }
};

export default connectDB;
