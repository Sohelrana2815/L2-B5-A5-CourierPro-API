"use strict";
// const updateReceiverProfile = async (
//   receiverId: string,
//   updateData: {
//     phone?: string;
//     address?: string;
//     city?: string;
//   }
// ) => {
//   // Check if at least one field is provided
//   if (!updateData.phone && !updateData.address && !updateData.city) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "At least one field (phone, address, or city) must be provided!"
//     );
//   }
//   // Find the user
//   const user = await User.findById(receiverId);
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "Receiver not found!");
//   }
//   // Prepare update object
//   const updateFields: Partial<typeof updateData> = {};
//   if (updateData.phone) {
//     updateFields.phone = updateData.phone;
//   }
//   if (updateData.address) {
//     updateFields.address = updateData.address;
//   }
//   if (updateData.city) {
//     updateFields.city = updateData.city;
//   }
//   // Update the receiver profile
//   const updatedUser = await User.findByIdAndUpdate(
//     receiverId,
//     { $set: updateFields },
//     { new: true, runValidators: true }
//   ).select("-password");
//   return updatedUser;
// };
