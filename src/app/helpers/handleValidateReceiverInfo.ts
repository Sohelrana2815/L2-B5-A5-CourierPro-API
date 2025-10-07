import AppError from "../errorHelpers/AppError";
import User from "../modules/user/user.model";
import httpStatus from "http-status-codes";
// Validate receiver information against registered users
export const handleValidateReceiverInfo = async (receiverInfo: {
  name: string;
  phone: string;
  address: string;
  city: string;
}) => {
  // Check if there's a registered user with RECEIVER role with this phone number
  const registeredReceiver = await User.findOne({
    phone: receiverInfo.phone,
    role: "RECEIVER",
    isDeleted: { $ne: true },
    accountStatus: { $ne: "BLOCKED" },
  });

  if (registeredReceiver) {
    // If a registered receiver exists, validate all provided info matches
    const { name, address, city } = receiverInfo;

    // Check if provided name matches (case-insensitive comparison)
    if (registeredReceiver.name.toLowerCase() !== name.toLowerCase()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Receiver information mismatch! A user with phone number ${receiverInfo.phone} is already registered with name "${registeredReceiver.name}". Please provide the correct name or use a different phone number.`
      );
    }

    // Check if provided address matches (case-insensitive comparison)
    if (registeredReceiver.address?.toLowerCase() !== address.toLowerCase()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Receiver information mismatch! The registered user "${registeredReceiver.name}" has a different address. Please provide the correct address or contact the receiver.`
      );
    }

    // Check if provided city matches (case-insensitive comparison)
    if (registeredReceiver.city?.toLowerCase() !== city.toLowerCase()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Receiver information mismatch! The registered user "${registeredReceiver.name}" has a different city. Please provide the correct city or contact the receiver.`
      );
    }

    return {
      isRegisteredReceiver: true,
      receiverId: registeredReceiver._id,
      validatedReceiverInfo: receiverInfo, // Use the provided info as it's validated
    };
  }

  // No registered receiver found, treat as guest receiver
  return {
    isRegisteredReceiver: false,
    receiverId: undefined,
    validatedReceiverInfo: receiverInfo,
  };
};
