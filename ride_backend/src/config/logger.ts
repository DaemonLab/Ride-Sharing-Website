import winston from "winston";

// colorize + simple makes logs readable in the terminal: "info: Server running on..."
const fmt = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
);

export const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: fmt }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

