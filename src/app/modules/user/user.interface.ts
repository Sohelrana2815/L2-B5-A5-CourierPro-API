export enum Role {
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
  ADMIN = "ADMIN",
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  role: "ADMIN" | "SENDER" | "RECEIVER";
  
}
