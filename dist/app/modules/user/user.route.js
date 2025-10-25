"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("./user.interface");
const router = (0, express_1.Router)();
// CREATE USER
router.post("/register", (0, validateRequest_1.validateRequest)(user_validation_1.createUserZodSchema), user_controller_1.UserControllers.createUser);
// GET ALL USERS
router.get("/all-users", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view all users"), user_controller_1.UserControllers.getAllUsers);
// GET ME
router.get("/me", (0, checkAuth_1.checkAuth)([...Object.values(user_interface_1.Role)], "User must be logged in to access profile"), user_controller_1.UserControllers.getMyProfile);
// ADMIN: Bulk soft delete users (placed before parameterized routes to avoid route collision)
router.patch("/bulk-soft-delete", (0, validateRequest_1.validateRequest)(user_validation_1.bulkSoftDeleteUsersZodSchema), (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can bulk soft delete users"), user_controller_1.UserControllers.bulkSoftDeleteUsers);
router.patch("/:id", (0, validateRequest_1.validateRequest)(user_validation_1.updateUserZodSchema), (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can make other user ADMIN"), user_controller_1.UserControllers.updateUser);
// ADMIN: Block user
router.patch("/block/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can block users"), user_controller_1.UserControllers.blockUser);
// ADMIN: Unblock user
router.patch("/unblock/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can unblock users"), user_controller_1.UserControllers.unblockUser);
// ADMIN: Soft delete user
router.patch("/soft-delete/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can soft delete users"), user_controller_1.UserControllers.softDeleteUser);
// ADMIN: Restore soft deleted user
router.patch("/restore/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can restore users"), user_controller_1.UserControllers.restoreUser);
// ADMIN: Promote user to admin
router.patch("/:id/promote-to-admin", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can promote users to admin"), user_controller_1.UserControllers.promoteUserToAdmin);
// ADMIN: Bulk soft delete users
// ...bulk-soft-delete route moved above to avoid matching by the ":id" route
exports.UserRoutes = router;
