import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest =
  (zodSchema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Old body:", req.body);
      req.body = await zodSchema.parseAsync(req.body);
      console.log("New body:", req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
