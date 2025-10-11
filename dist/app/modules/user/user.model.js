"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
// Embaded schema
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
}, {
    _id: false,
    versionKey: false,
});
// Actual user schema
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, select: false, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    picture: { type: String },
    accountStatus: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE,
        index: true,
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        required: true,
        index: true,
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    auths: [authProviderSchema],
}, {
    timestamps: true,
    versionKey: false,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
