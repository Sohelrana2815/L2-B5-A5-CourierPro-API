import { Router } from "express";
import { UserControllers } from "./user.controller";
import {
  createUserZodSchema,
  updateUserZodSchema,
  bulkSoftDeleteUsersZodSchema,
} from "./user.validation";

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

// ADMIN: Bulk soft delete users (placed before parameterized routes to avoid route collision)
router.patch(
  "/bulk-soft-delete",
  validateRequest(bulkSoftDeleteUsersZodSchema),
  checkAuth(Role.ADMIN, "Only ADMIN can bulk soft delete users"),
  UserControllers.bulkSoftDeleteUsers
);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(Role.ADMIN, "Only ADMIN can make other user ADMIN"),
  UserControllers.updateUser
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

// ADMIN: Promote user to admin
router.patch(
  "/:id/promote-to-admin",
  checkAuth(Role.ADMIN, "Only ADMIN can promote users to admin"),
  UserControllers.promoteUserToAdmin
);

// ADMIN: Bulk soft delete users
// ...bulk-soft-delete route moved above to avoid matching by the ":id" route

export const UserRoutes = router;
