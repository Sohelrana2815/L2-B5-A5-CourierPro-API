import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
// Calculate fee based on weight (simple pricing logic)
export const calculateFee = (weightKg: number): number => {
  const basePrice = 50; // Base price  in BDT
  const pricePerKg = 20; // Price will increase per kg in BDT

  if (typeof weightKg !== "number" || !isFinite(weightKg)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid weight");
  }
  if (weightKg < 0.1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Weight must be at least 0.1 kg"
    );
  }

  if (weightKg <= 1) {
    return basePrice;
  } else {
    const extra = Math.max(0, weightKg - 1);
    const fee = basePrice + extra * pricePerKg;
    return Math.round(fee * 100) / 100;
  }
};