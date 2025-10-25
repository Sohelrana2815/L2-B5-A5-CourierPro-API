import { Types } from "mongoose";

export enum ParcelStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  ON_HOLD = "ON_HOLD",
}

export interface IStatusLog {
  status: ParcelStatus;
  timestamp: Date;
  updatedBy: Types.ObjectId;
  location?: string;
  note?: string;
}

export interface IReceiverInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export interface IParcelDetails {
  type: string;
  weightKg: number;
  description: string;
}

export interface IParcel {
  _id?: Types.ObjectId;
  trackingId: string;
  senderId: Types.ObjectId;
  receiverId?: Types.ObjectId;
  receiverInfo: IReceiverInfo;
  parcelDetails: IParcelDetails;
  fee: number;
  currentStatus: ParcelStatus;
  statusHistory: IStatusLog[];
  isBlocked: boolean;
  expectedDeliveryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
