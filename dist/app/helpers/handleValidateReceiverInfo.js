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
exports.handleValidateReceiverInfo = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Validate receiver information against registered users
const handleValidateReceiverInfo = (receiverInfo) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Check if there's a registered user with RECEIVER role with this phone number
    const registeredReceiver = yield user_model_1.default.findOne({
        phone: receiverInfo.phone,
        role: "RECEIVER",
        isDeleted: { $ne: true },
        accountStatus: { $ne: "BLOCKED" },
    });
    if (!registeredReceiver) {
        // Receiver must be registered - no guest receivers allowed
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `No registered receiver found with phone number ${receiverInfo.phone}. The receiver must be a registered user. Please ask the receiver to register first or update the profile.`);
    }
    // If a registered receiver exists, validate all provided info matches
    const { name, address, city } = receiverInfo;
    // Check if provided name matches (case-insensitive comparison)
    if (registeredReceiver.name.toLowerCase() !== name.toLowerCase()) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Receiver information mismatch! A user with phone number ${receiverInfo.phone} is already registered with name "${registeredReceiver.name}". Please provide the correct name or use a different phone number.`);
    }
    // Check if provided address matches (case-insensitive comparison)
    if (((_a = registeredReceiver.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== address.toLowerCase()) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Receiver information mismatch! The registered user "${registeredReceiver.name}" has a different address. Please provide the correct address or contact the receiver.`);
    }
    // Check if provided city matches (case-insensitive comparison)
    if (((_b = registeredReceiver.city) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== city.toLowerCase()) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Receiver information mismatch! The registered user "${registeredReceiver.name}" has a different city. Please provide the correct city or contact the receiver.`);
    }
    return {
        isRegisteredReceiver: true,
        receiverId: registeredReceiver._id,
        validatedReceiverInfo: receiverInfo, // Use the provided info as it's validated
    };
});
exports.handleValidateReceiverInfo = handleValidateReceiverInfo;
