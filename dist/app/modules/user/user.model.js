"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false, select: false },
    address: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.SENDER,
    },
}, {
    timestamps: true,
    versionKey: false,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
