import winston from "winston";

const isDev = process.env.NODE_ENV !== "production";

// In production (Render), the platform captures console output.
// File transports are only enabled locally — Render's filesystem is ephemeral
// and log files would be lost on every redeploy.
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
];

if (isDev) {
  transports.push(new winston.transports.File({ filename: "logs/error.log", level: "error" }));
  transports.push(new winston.transports.File({ filename: "logs/combined.log" }));
}

export const logger = winston.createLogger({
  level: "info",
  transports,
});

