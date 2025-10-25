"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelPublicRoutes = void 0;
const express_1 = require("express");
// import { checkAuth } from "../../../middlewares/checkAuth";
// import { Role } from "../../user/user.interface";
const parcel_public_controller_1 = __importDefault(require("./parcel.public.controller"));
const router = (0, express_1.Router)();
router.get("/public/track-parcel/:trackingId", parcel_public_controller_1.default.trackParcel);
exports.ParcelPublicRoutes = router;
