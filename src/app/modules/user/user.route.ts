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


// ADMIN: Block user
router.patch(
  "/:id/block",
  checkAuth(Role.ADMIN, "Only ADMIN can block users"),
  UserControllers.blockUser
);

// ADMIN: Unblock user
router.patch(
  "/:id/unblock",
  checkAuth(Role.ADMIN, "Only ADMIN can unblock users"),
  UserControllers.unblockUser
);

// ADMIN: Soft delete user
router.patch(
  "/:id/soft-delete",
  checkAuth(Role.ADMIN, "Only ADMIN can soft delete users"),
  UserControllers.softDeleteUser
);

// ADMIN: Restore soft deleted user
router.patch(
  "/:id/restore",
  checkAuth(Role.ADMIN, "Only ADMIN can restore users"),
  UserControllers.restoreUser
);

export const UserRoutes = router;
