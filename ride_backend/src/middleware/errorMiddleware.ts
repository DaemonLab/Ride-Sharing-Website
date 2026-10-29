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
      message: "Please check the information you entered and try again.",
    });
  }

  // 2. Domain / business logic error — e.g. "Ride not found", "Not the owner"
  const candidate = (error as Error & { statusCode?: number; status?: number }).statusCode
    ?? (error as Error & { status?: number }).status;
  const statusCode = Number.isInteger(candidate) && candidate! >= 400 && candidate! <= 599 ? candidate! : 500;
  logger.error(`${statusCode} — ${error.message}`);

  res.status(statusCode).json({
    success: false,
    message: ({
      400: "Please check the information you entered and try again.",
      401: "Please sign in to continue.",
      403: "You do not have permission to perform this action.",
      404: "The requested item could not be found.",
      409: "This item has changed. Please refresh and try again.",
      429: "Too many requests. Please wait a few minutes and try again.",
    } as Record<number, string>)[statusCode] ?? "Something went wrong. Please try again later.",
  });
}

