import { Types } from "mongoose";

export enum Role {
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
  ADMIN = "ADMIN",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: Role;
  address?: string;
  picture?: string;
  accountStatus?: IsActive;
  isDeleted?: boolean;
  isVerified?: boolean;
  auths: IAuthProvider[];
  createdParcels?: Types.ObjectId[];
}
