import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";

import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.get(
  "/all-users", 
  checkAuth(Role.ADMIN, "Only ADMIN can view all users"), 
  UserControllers.getAllUsers
);

router.patch(
  "/:id",
  checkAuth(Object.values(Role), "You must be logged in to update your profile"),
  UserControllers.updateUser
);

export const UserRoutes = router;
