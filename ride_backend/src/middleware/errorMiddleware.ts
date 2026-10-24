import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";

// Central error handler — all errors reach here via next(error).
// Handles three cases: Zod validation errors, domain errors with a statusCode, and unexpected server errors.
export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  // 1. Zod validation error — bad request body (e.g. missing field, wrong type)
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", "),
    });
  }

  // 2. Domain / business logic error — e.g. "Ride not found", "Not the owner"
  const statusCode = (error as any).statusCode || 500;
  logger.error(`${statusCode} — ${error.message}`);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : error.message,
  });
}

