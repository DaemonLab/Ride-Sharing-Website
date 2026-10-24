import { Request, Response, NextFunction } from "express";

// Wraps an async route handler so you don't need try/catch in every controller.
// Any error thrown inside fn is caught here and passed to next(error),
// which sends it to the central errorHandler in errorMiddleware.ts.
export function asyncHandler(fn: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
