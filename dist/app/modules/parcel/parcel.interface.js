"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelStatus = void 0;
var ParcelStatus;
(function (ParcelStatus) {
    ParcelStatus["REQUESTED"] = "REQUESTED";
    ParcelStatus["APPROVED"] = "APPROVED";
    ParcelStatus["PICKED_UP"] = "PICKED_UP";
    ParcelStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ParcelStatus["DELIVERED"] = "DELIVERED";
    ParcelStatus["CANCELLED"] = "CANCELLED";
    ParcelStatus["RETURNED"] = "RETURNED";
    ParcelStatus["ON_HOLD"] = "ON_HOLD";
})(ParcelStatus || (exports.ParcelStatus = ParcelStatus = {}));
