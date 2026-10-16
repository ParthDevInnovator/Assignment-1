import { Request, Response, NextFunction, RequestHandler } from "express";

// Express 4 doesn't forward rejected promises to the error handler, so wrap async routes.
export const asyncHandler =
  <T extends Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>) =>
  ((req, res, next) => {
    fn(req as T, res, next).catch(next);
  }) as RequestHandler;
