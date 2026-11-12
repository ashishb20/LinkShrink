import dotenv from "dotenv";

dotenv.config();

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const port = Number(process.env.PORT) || 5000;
const nodeEnv = process.env.NODE_ENV || "development";

export const config = Object.freeze({
  nodeEnv,
  port,
  baseUrl: trimTrailingSlash(process.env.BASE_URL || `http://localhost:${port}`),
  frontendUrl: trimTrailingSlash(process.env.FRONTEND_URL || "*"),
  mongoUri: process.env.MONGO_URI || "",
  logLevel: process.env.LOG_LEVEL || "info",
});

export const assertConfig = () => {
  const missing = [];
  if (!config.mongoUri) missing.push("MONGO_URI");
  if (nodeEnv === "production" && !process.env.BASE_URL) missing.push("BASE_URL");
  if (nodeEnv === "production" && !process.env.FRONTEND_URL) missing.push("FRONTEND_URL");
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  try {
    new URL(config.baseUrl);
  } catch {
    throw new Error(`BASE_URL must be a valid URL: ${config.baseUrl}`);
  }
};
