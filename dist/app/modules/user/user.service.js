"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = __importDefault(require("./user.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isUserExist = yield user_model_1.default.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "User already exist!");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND) || 10);
    const authProvider = {
        provider: "credentials",
        providerId: email,
    };
    const user = yield user_model_1.default.create(Object.assign({ password: hashedPassword, email, auths: [authProvider] }, rest));
    const userObj = user.toObject();
    return { name: userObj.name };
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.default.findById(userId);
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist!");
    }
    if (payload.role) {
        // Only admins can update roles
        if (decodedToken.role !== user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only administrators can update user roles!");
        }
        // Additional validation for ADMIN role assignment
        if (payload.role === user_interface_1.Role.ADMIN) {
            // Check if the target user exists and is not already an admin
            if (isUserExist.role === user_interface_1.Role.ADMIN) {
                throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already an administrator!");
            }
            // Optional: Add additional security checks here
            // For example, require certain conditions to promote to admin
            // or log the promotion for audit purposes
        }
        // Prevent users from demoting other admins (maintain admin privileges)
        if (isUserExist.role === user_interface_1.Role.ADMIN && payload.role !== user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Cannot demote an existing administrator. Admin privileges can only be managed by system administrators.");
        }
    }
    if (payload.accountStatus || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.SENDER ||
            decodedToken.role === user_interface_1.Role.RECEIVER) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You are not allowed to update status!");
        }
    }
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, Number(env_1.envVars.BCRYPT_SALT_ROUND) || 10);
    }
    const newUpdatedUser = yield user_model_1.default.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return newUpdatedUser;
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find({ isDeleted: { $ne: true } });
    const totalUsers = yield user_model_1.default.countDocuments({ isDeleted: { $ne: true } });
    return {
        data: users,
        meta: { total: totalUsers },
    };
});
// ADMIN: Block user
const blockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId).select("+isDeleted");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found!");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot block a deleted user!");
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { accountStatus: "BLOCKED" }, { new: true });
    return updatedUser;
});
// ADMIN: Unblock user
const unblockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findByIdAndUpdate(userId, { accountStatus: "ACTIVE" }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found!");
    }
    return user;
});
// ADMIN: Soft delete user
const softDeleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found!");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already deleted!");
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    return updatedUser;
});
// ADMIN: Restore soft deleted user
const restoreUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found!");
    }
    if (!user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not deleted!");
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isDeleted: false }, { new: true });
    return updatedUser;
});
// ADMIN: Bulk soft delete users
const bulkSoftDeleteUsers = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    // First, check which users are already deleted
    const alreadyDeletedUsers = yield user_model_1.default.find({
        _id: { $in: userIds },
        isDeleted: true
    }).select('_id name');
    // Filter out already deleted users from the update operation
    const usersToDelete = userIds.filter(id => !alreadyDeletedUsers.some(user => user._id.toString() === id));
    const result = yield user_model_1.default.updateMany({
        _id: { $in: usersToDelete },
        isDeleted: { $ne: true } // Additional safety check
    }, { isDeleted: true });
    if (result.matchedCount === 0 && alreadyDeletedUsers.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No users found to delete!");
    }
    return {
        message: `${result.modifiedCount} users soft deleted successfully`,
        deletedCount: result.modifiedCount,
        alreadyDeletedCount: alreadyDeletedUsers.length,
        alreadyDeletedUsers: alreadyDeletedUsers.map(user => ({
            id: user._id,
            name: user.name
        })),
        matchedCount: result.matchedCount + alreadyDeletedUsers.length,
    };
});
// ADMIN: Promote user to admin
const promoteUserToAdmin = (userId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const targetUser = yield user_model_1.default.findById(userId);
    if (!targetUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Target user not found!");
    }
    if (targetUser.role === user_interface_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already an administrator!");
    }
    if (targetUser.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot promote a deleted user to administrator!");
    }
    if (targetUser.accountStatus === "BLOCKED") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot promote a blocked user to administrator!");
    }
    // Update user role to ADMIN
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { role: user_interface_1.Role.ADMIN }, { new: true, runValidators: true });
    return {
        message: `User ${targetUser.name} has been successfully promoted to administrator`,
        updatedUser,
    };
});
exports.UserServices = {
    createUser,
    getAllUsers,
    updateUser,
    blockUser,
    unblockUser,
    softDeleteUser,
    restoreUser,
    bulkSoftDeleteUsers,
    promoteUserToAdmin,
};
