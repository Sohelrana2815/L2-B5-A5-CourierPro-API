"use strict";
// Embedded schemas
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const parcel_interface_1 = require("./parcel.interface");
// Embedded schemas
const statusLogSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelStatus),
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    location: {
        type: String,
        trim: true,
    },
    note: {
        type: String,
        trim: true,
    },
}, {
    _id: false,
    versionKey: false,
});
const receiverInfoSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    _id: false,
    versionKey: false,
});
const parcelDetailsSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        trim: true,
    },
    weightKg: {
        type: Number,
        required: true,
        min: 0.1,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    _id: false,
    versionKey: false,
});
// Main Parcel Schema
const parcelSchema = new mongoose_1.Schema({
    trackingId: {
        type: String,
        unique: true,
        trim: true,
        index: true,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    receiverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    receiverInfo: {
        type: receiverInfoSchema,
        required: true,
    },
    parcelDetails: {
        type: parcelDetailsSchema,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
        min: 0,
    },
    currentStatus: {
        type: String,
        enum: Object.values(parcel_interface_1.ParcelStatus),
        default: parcel_interface_1.ParcelStatus.REQUESTED,
        index: true,
    },
    statusHistory: {
        type: [statusLogSchema],
        default: [],
    },
    isBlocked: {
        type: Boolean,
        default: false,
        index: true,
    },
    expectedDeliveryDate: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});
parcelSchema.pre("save", function (next) {
    if (!this.trackingId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const random = Math.floor(100000 + Math.random() * 900000);
        this.trackingId = `TRK-${year}${month}${day}-${random}`;
    }
    next();
});
const Parcel = (0, mongoose_1.model)("Parcel", parcelSchema);
exports.default = Parcel;
