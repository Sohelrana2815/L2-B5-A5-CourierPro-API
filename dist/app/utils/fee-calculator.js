"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFee = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Calculate fee based on weight (simple pricing logic)
const calculateFee = (weightKg) => {
    const basePrice = 50; // Base price  in BDT
    const pricePerKg = 20; // Price will increase per kg in BDT
    if (typeof weightKg !== "number" || !isFinite(weightKg)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid weight");
    }
    if (weightKg < 0.1) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Weight must be at least 0.1 kg");
    }
    if (weightKg <= 1) {
        return basePrice;
    }
    else {
        const extra = Math.max(0, weightKg - 1);
        const fee = basePrice + extra * pricePerKg;
        return Math.round(fee * 100) / 100;
    }
};
exports.calculateFee = calculateFee;
