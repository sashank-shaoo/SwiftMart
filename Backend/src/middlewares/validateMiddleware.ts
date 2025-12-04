import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate =
  (schema: z.ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((e: z.core.$ZodIssue) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };
