import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

// Embaded schema

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

// Actual user schema

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    picture: { type: String },
    accountStatus: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.SENDER,
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, select: false },
    auths: [authProviderSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model<IUser>("User", userSchema);

export default User;
