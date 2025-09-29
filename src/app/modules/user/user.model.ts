import { model, Schema } from "mongoose";
import { IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    address: { type: String },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.SENDER,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model<IUser>("User", userSchema);

export default User;
