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
        console.error(
          "Validation Error:",
          JSON.stringify(error.issues, null, 2),
        );
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          details: error.issues.map((e: z.ZodIssue) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };
