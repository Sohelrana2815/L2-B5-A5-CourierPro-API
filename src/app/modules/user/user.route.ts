import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import { ZodObject } from "zod";
import { createUserZodSchema } from "./user.validation";

const validateRequest =
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

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);
router.get("/all-users", UserControllers.getAllUsers);

export const UserRoutes = router;
