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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const parcel_model_1 = __importDefault(require("../parcel.model"));
const trackParcelByTRKId = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const parcel = yield parcel_model_1.default.findOne({ trackingId }, {
        "parcelDetails.type": 1,
        "receiverInfo.city": 1,
        currentStatus: 1,
        statusHistory: 1,
        isBlocked: 1,
        createdAt: 1,
        trackingId: 1,
    });
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    if (parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is blocked!");
    }
    // Return only the public fields
    return {
        parcelType: (_a = parcel.parcelDetails) === null || _a === void 0 ? void 0 : _a.type,
        destinationCity: (_b = parcel.receiverInfo) === null || _b === void 0 ? void 0 : _b.city,
        currentStatus: parcel.currentStatus,
        statusLogs: parcel.statusHistory || [],
        trackingId: parcel.trackingId,
        createdAt: parcel.createdAt,
        isBlocked: parcel.isBlocked,
    };
});
const ParcelPublicServices = {
    trackParcelByTRKId,
};
exports.default = ParcelPublicServices;
