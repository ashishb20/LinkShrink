import { config, assertConfig } from './config/env.js';
import express from 'express';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import app from './app.js';
import logger from './config/logger.js';
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  assertConfig();
} catch (err) {
  logger.fatal(err.message);
  process.exit(1);
}

connectDB();

import fs from "fs";
import path from "path";

const frontendDistPath = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
