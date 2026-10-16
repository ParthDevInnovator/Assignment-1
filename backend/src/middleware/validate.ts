import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Parses req.body with the given schema and replaces it with the cleaned data.
export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: result.error.errors[0]?.message ?? "Invalid input",
        errors: result.error.errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
