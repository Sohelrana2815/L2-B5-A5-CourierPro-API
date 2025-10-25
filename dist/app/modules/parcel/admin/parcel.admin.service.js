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
exports.ParcelAdminServices = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errorHelpers/AppError"));
const parcel_interface_1 = require("../parcel.interface");
const parcel_model_1 = __importDefault(require("../parcel.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// VALIDATE STATUS TRANSITION
const validateStatusTransition = (currentStatus, newStatus, userRole) => {
    // Define allowed transitions based on role and current status
    const allowedTransitions = {
        RECEIVER: {
            [parcel_interface_1.ParcelStatus.REQUESTED]: [parcel_interface_1.ParcelStatus.APPROVED],
            [parcel_interface_1.ParcelStatus.APPROVED]: [],
            [parcel_interface_1.ParcelStatus.PICKED_UP]: [],
            [parcel_interface_1.ParcelStatus.IN_TRANSIT]: [],
            [parcel_interface_1.ParcelStatus.DELIVERED]: [],
            [parcel_interface_1.ParcelStatus.CANCELLED]: [],
            [parcel_interface_1.ParcelStatus.RETURNED]: [],
            [parcel_interface_1.ParcelStatus.ON_HOLD]: [],
        },
        ADMIN: {
            [parcel_interface_1.ParcelStatus.APPROVED]: [parcel_interface_1.ParcelStatus.PICKED_UP],
            [parcel_interface_1.ParcelStatus.PICKED_UP]: [
                parcel_interface_1.ParcelStatus.IN_TRANSIT,
                parcel_interface_1.ParcelStatus.ON_HOLD,
                parcel_interface_1.ParcelStatus.RETURNED,
            ],
            [parcel_interface_1.ParcelStatus.IN_TRANSIT]: [
                parcel_interface_1.ParcelStatus.DELIVERED,
                parcel_interface_1.ParcelStatus.ON_HOLD,
                parcel_interface_1.ParcelStatus.RETURNED,
            ],
            [parcel_interface_1.ParcelStatus.DELIVERED]: [], // Final status - no further transitions
            [parcel_interface_1.ParcelStatus.CANCELLED]: [], // Final status - no further transitions
            [parcel_interface_1.ParcelStatus.RETURNED]: [], // Final status - no further transitions
            [parcel_interface_1.ParcelStatus.ON_HOLD]: [
                parcel_interface_1.ParcelStatus.PICKED_UP,
                parcel_interface_1.ParcelStatus.IN_TRANSIT,
                parcel_interface_1.ParcelStatus.RETURNED,
            ],
            [parcel_interface_1.ParcelStatus.REQUESTED]: [
                parcel_interface_1.ParcelStatus.APPROVED,
                parcel_interface_1.ParcelStatus.ON_HOLD,
                parcel_interface_1.ParcelStatus.CANCELLED,
            ],
        },
    };
    const roleTransitions = allowedTransitions[userRole] || {};
    const allowedNewStatuses = roleTransitions[currentStatus] || [];
    return allowedNewStatuses.includes(newStatus);
};
// GET ALL PARCELS (Admin Role) with pagination and search
const getAllParcels = (page, limit, search) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Parse and sanitize inputs
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 10)); // max 100 per page
    const skip = (parsedPage - 1) * parsedLimit;
    // Build search query
    const searchRegex = search && search.trim() ? new RegExp(search.trim(), "i") : null;
    // MongoDB aggregation pipeline for searching with joins
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aggregationPipeline = [
        // Join with sender User collection
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderDetails",
            },
        },
        // Join with receiver User collection
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiverDetails",
            },
        },
        // Unwind arrays to get single objects (preserve null arrays for cases where users might be deleted)
        {
            $unwind: {
                path: "$senderDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$receiverDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];
    // Add search filter if provided
    if (searchRegex) {
        aggregationPipeline.push({
            $match: {
                $or: [
                    { trackingId: searchRegex },
                    { "receiverInfo.city": searchRegex },
                    { "senderDetails.name": searchRegex },
                    { "receiverDetails.name": searchRegex },
                ],
            },
        });
    }
    // Add remaining pipeline stages
    aggregationPipeline.push(
    // Sort by creation date
    { $sort: { createdAt: -1 } }, 
    // Apply pagination
    { $skip: skip }, { $limit: parsedLimit }, 
    // Project only needed fields
    {
        $project: {
            trackingId: 1,
            senderId: 1,
            receiverId: 1,
            receiverInfo: 1,
            parcelDetails: 1,
            fee: 1,
            currentStatus: 1,
            statusHistory: 1,
            isBlocked: 1,
            createdAt: 1,
            updatedAt: 1,
            senderDetails: { name: 1, email: 1, phone: 1 },
            receiverDetails: { name: 1, email: 1, phone: 1 },
        },
    });
    // Separate aggregation for count (without pagination)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countPipeline = [
        // Join with sender User collection
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderDetails",
            },
        },
        // Join with receiver User collection
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiverDetails",
            },
        },
        // Unwind arrays to get single objects
        {
            $unwind: {
                path: "$senderDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$receiverDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];
    // Add search filter to count pipeline if provided
    if (searchRegex) {
        countPipeline.push({
            $match: {
                $or: [
                    { trackingId: searchRegex },
                    { "receiverInfo.city": searchRegex },
                    { "senderDetails.name": searchRegex },
                    { "receiverDetails.name": searchRegex },
                ],
            },
        });
    }
    // Add count stage
    countPipeline.push({ $count: "total" });
    // Run aggregation and count in parallel
    const [parcels, countResult] = yield Promise.all([
        parcel_model_1.default.aggregate(aggregationPipeline),
        parcel_model_1.default.aggregate(countPipeline),
    ]);
    const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const totalPages = Math.ceil(total / parsedLimit);
    return {
        data: parcels,
        meta: Object.assign({ total, page: parsedPage, limit: parsedLimit, totalPages }, (search && search.trim() && { searchTerm: search.trim() })),
    };
});
// GET PARCEL BY ID (Admin Role)
const getParcelById = (parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId)
        .populate("senderId", "name email phone")
        .populate("receiverId", "name email phone");
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    return parcel;
});
// BLOCK PARCEL (Admin Role)
const blockParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if the parcel is already blocked
    if (parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is already blocked!");
    }
    // Update the parcel to blocked status
    parcel.isBlocked = true;
    // Add status log entry for blocking
    const blockStatusLog = {
        status: parcel_interface_1.ParcelStatus.ON_HOLD,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel blocked by admin",
    };
    parcel.statusHistory.push(blockStatusLog);
    // If parcel was in transit or approved, set status to ON_HOLD
    if (parcel.currentStatus === parcel_interface_1.ParcelStatus.APPROVED ||
        parcel.currentStatus === parcel_interface_1.ParcelStatus.PICKED_UP ||
        parcel.currentStatus === parcel_interface_1.ParcelStatus.IN_TRANSIT) {
        parcel.currentStatus = parcel_interface_1.ParcelStatus.ON_HOLD;
    }
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// UNBLOCK PARCEL (Admin Role)
const unblockParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if the parcel is not blocked
    if (!parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is not blocked!");
    }
    // Update the parcel to unblocked status
    parcel.isBlocked = false;
    // Add status log entry for unblocking
    const unblockStatusLog = {
        status: parcel.currentStatus, // Keep the current status
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel unblocked by admin",
    };
    parcel.statusHistory.push(unblockStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// PICK UP PARCEL (Admin Role) - APPROVED → PICKED_UP
const pickUpParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Validate status transition
    if (!validateStatusTransition(parcel.currentStatus, parcel_interface_1.ParcelStatus.PICKED_UP, "ADMIN")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot pick up parcel with status: ${parcel.currentStatus}. Only parcels with APPROVED status can be picked up.`);
    }
    // Update the parcel status to PICKED_UP
    parcel.currentStatus = parcel_interface_1.ParcelStatus.PICKED_UP;
    // Add status log entry
    const pickUpStatusLog = {
        status: parcel_interface_1.ParcelStatus.PICKED_UP,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel picked up by courier",
    };
    parcel.statusHistory.push(pickUpStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// START TRANSIT (Admin Role) - PICKED_UP → IN_TRANSIT
const startTransit = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Validate status transition
    if (!validateStatusTransition(parcel.currentStatus, parcel_interface_1.ParcelStatus.IN_TRANSIT, "ADMIN")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot start transit for parcel with status: ${parcel.currentStatus}. Only parcels with PICKED_UP status can start transit.`);
    }
    // Update the parcel status to IN_TRANSIT
    parcel.currentStatus = parcel_interface_1.ParcelStatus.IN_TRANSIT;
    // Add status log entry
    const transitStatusLog = {
        status: parcel_interface_1.ParcelStatus.IN_TRANSIT,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel in transit to destination",
    };
    parcel.statusHistory.push(transitStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// DELIVER PARCEL (Admin Role) - IN_TRANSIT → DELIVERED
const deliverParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Validate status transition
    if (!validateStatusTransition(parcel.currentStatus, parcel_interface_1.ParcelStatus.DELIVERED, "ADMIN")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot deliver parcel with status: ${parcel.currentStatus}. Only parcels with IN_TRANSIT status can be delivered.`);
    }
    // Update the parcel status to DELIVERED
    parcel.currentStatus = parcel_interface_1.ParcelStatus.DELIVERED;
    // Add status log entry
    const deliverStatusLog = {
        status: parcel_interface_1.ParcelStatus.DELIVERED,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel delivered successfully",
    };
    parcel.statusHistory.push(deliverStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// RETURN PARCEL (Admin Role) - Can return from various statuses
const returnParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Validate status transition
    if (!validateStatusTransition(parcel.currentStatus, parcel_interface_1.ParcelStatus.RETURNED, "ADMIN")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot return parcel with status: ${parcel.currentStatus}.`);
    }
    // Update the parcel status to RETURNED
    parcel.currentStatus = parcel_interface_1.ParcelStatus.RETURNED;
    // Add status log entry
    const returnStatusLog = {
        status: parcel_interface_1.ParcelStatus.RETURNED,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel returned to sender",
    };
    parcel.statusHistory.push(returnStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// HOLD PARCEL (Admin Role) - Can put parcels on hold from various statuses
const holdParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Validate status transition
    if (!validateStatusTransition(parcel.currentStatus, parcel_interface_1.ParcelStatus.ON_HOLD, "ADMIN")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot put parcel on hold with status: ${parcel.currentStatus}.`);
    }
    // Update the parcel status to ON_HOLD
    parcel.currentStatus = parcel_interface_1.ParcelStatus.ON_HOLD;
    // Add status log entry
    const holdStatusLog = {
        status: parcel_interface_1.ParcelStatus.ON_HOLD,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel put on hold",
    };
    parcel.statusHistory.push(holdStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// GET DASHBOARD OVERVIEW (Admin Role) - Get parcel counts by status for dashboard overview
const getDashboardOverview = () => __awaiter(void 0, void 0, void 0, function* () {
    // Use aggregation to get counts for each status in a single query
    const dashboardStats = yield parcel_model_1.default.aggregate([
        {
            $group: {
                _id: "$currentStatus",
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                status: "$_id",
                count: 1,
            },
        },
    ]);
    // Get total count of all parcels
    const totalCount = yield parcel_model_1.default.countDocuments({});
    // Initialize counts with 0 for all statuses
    const counts = {
        total: totalCount,
        delivered: 0,
        inTransit: 0,
        requested: 0,
        cancelled: 0,
    };
    // Map the aggregation results to the expected format
    dashboardStats.forEach((stat) => {
        switch (stat.status) {
            case parcel_interface_1.ParcelStatus.DELIVERED:
                counts.delivered = stat.count;
                break;
            case parcel_interface_1.ParcelStatus.IN_TRANSIT:
                counts.inTransit = stat.count;
                break;
            case parcel_interface_1.ParcelStatus.REQUESTED:
                counts.requested = stat.count;
                break;
            case parcel_interface_1.ParcelStatus.CANCELLED:
                counts.cancelled = stat.count;
                break;
        }
    });
    return counts;
});
// GET FINAL STATUS COUNTS (Admin Role) - Get counts for ultimate statuses only (DELIVERED, CANCELLED, RETURNED)
const getFinalStatusCounts = () => __awaiter(void 0, void 0, void 0, function* () {
    // Use aggregation to get counts for final statuses in a single query
    const finalStatusStats = yield parcel_model_1.default.aggregate([
        {
            $match: {
                currentStatus: {
                    $in: [
                        parcel_interface_1.ParcelStatus.DELIVERED,
                        parcel_interface_1.ParcelStatus.CANCELLED,
                        parcel_interface_1.ParcelStatus.RETURNED,
                    ],
                },
            },
        },
        {
            $group: {
                _id: "$currentStatus",
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                status: "$_id",
                count: 1,
            },
        },
    ]);
    // Initialize counts with 0
    const counts = {
        delivered: 0,
        cancelled: 0,
        returned: 0,
        total: 0,
        successRate: 0,
    };
    // Map the aggregation results
    finalStatusStats.forEach((stat) => {
        switch (stat.status) {
            case parcel_interface_1.ParcelStatus.DELIVERED:
                counts.delivered = stat.count;
                break;
            case parcel_interface_1.ParcelStatus.CANCELLED:
                counts.cancelled = stat.count;
                break;
            case parcel_interface_1.ParcelStatus.RETURNED:
                counts.returned = stat.count;
                break;
        }
    });
    // Calculate total and success rate
    counts.total = counts.delivered + counts.cancelled + counts.returned;
    counts.successRate =
        counts.total > 0 ? Math.round((counts.delivered / counts.total) * 100) : 0;
    return counts;
});
// GET COMPREHENSIVE PARCEL TRENDS (Admin Role) - Get both 7 and 30 day trends in one call
const getComprehensiveParcelTrends = () => __awaiter(void 0, void 0, void 0, function* () {
    const [trends7Days, trends30Days] = yield Promise.all([
        getParcelTrends(7),
        getParcelTrends(30),
    ]);
    return {
        trends7Days: trends7Days,
        trends30Days: trends30Days,
        comparison: {
            requests7Days: trends7Days.summary.totalRequests,
            requests30Days: trends30Days.summary.totalRequests,
            average7Days: trends7Days.summary.averagePerDay,
            average30Days: trends30Days.summary.averagePerDay,
            growthRate: trends30Days.summary.totalRequests > 0
                ? Math.round((trends7Days.summary.totalRequests /
                    trends30Days.summary.totalRequests) *
                    100)
                : 0,
        },
    };
});
const getParcelTrends = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    // Get daily parcel creation counts using aggregation
    const dailyTrends = yield parcel_model_1.default.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                    },
                },
                count: { $sum: 1 },
                date: { $first: "$createdAt" },
            },
        },
        {
            $sort: { _id: 1 },
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                count: 1,
                formattedDate: {
                    $dateToString: {
                        format: "%b %d, %Y",
                        date: "$date",
                    },
                },
            },
        },
    ]);
    // Get total count for percentage calculation
    const totalCount = yield parcel_model_1.default.countDocuments({
        createdAt: { $gte: startDate },
    });
    // Calculate percentages and add trend indicators
    const trendsWithPercentages = dailyTrends.map((trend) => {
        const percentage = totalCount > 0 ? Math.round((trend.count / totalCount) * 100) : 0;
        return Object.assign(Object.assign({}, trend), { percentage, trend: trend.count > 0 ? "active" : "inactive" });
    });
    // Calculate summary statistics
    const summary = {
        totalRequests: totalCount,
        averagePerDay: totalCount > 0 ? Math.round(totalCount / days) : 0,
        mostActiveDay: dailyTrends.reduce((max, current) => (current.count > max.count ? current : max), dailyTrends[0] || { count: 0, date: null }),
        period: `${days} days`,
        startDate: startDate.toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    };
    return {
        summary,
        dailyTrends: trendsWithPercentages,
        trends: {
            last7Days: days === 7 ? trendsWithPercentages : null,
            last30Days: days === 30 ? trendsWithPercentages : null,
        },
    };
});
exports.ParcelAdminServices = {
    getAllParcels,
    getParcelById,
    blockParcel,
    unblockParcel,
    pickUpParcel,
    startTransit,
    deliverParcel,
    returnParcel,
    holdParcel,
    getDashboardOverview,
    getFinalStatusCounts,
    getParcelTrends,
    getComprehensiveParcelTrends,
};
