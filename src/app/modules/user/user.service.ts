/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import User from "./user.model";

import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  // if (isUserExist) {
  //   throw new AppError(httpStatus.CONFLICT, "User already exist!");
  // }
  // Hash the password
  const hashedPassword = await bcryptjs.hash(password as string, 10);

  // Password matching
  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = User.create({
    password: hashedPassword,
    email,
    auths: [authProvider],
    ...rest,
  });

  return user;
};



const updateUser = async( userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload) => {




const isUserExist = await User.findById(userId);


// if(!isUserExist){
//   throw new AppError(httpStatus.BAD_REQUEST, "User does not exist!");
// }





if(payload.role){

  
  if(decodedToken.role === Role.SENDER || decodedToken.role===Role.RECEIVER){
    throw new AppError(httpStatus.BAD_REQUEST, "You are not allowed to update role!");
  }

  if(payload.role ===Role.ADMIN && decodedToken.role===Role.SENDER || decodedToken.role === Role.RECEIVER){
    throw new AppError(httpStatus.BAD_REQUEST, "You are not allowed to update role!");
  }
  
}



if(payload.accountStatus || payload.isDeleted || payload.isVerified){
   if(decodedToken.role === Role.SENDER || decodedToken.role===Role.RECEIVER){
    throw new AppError(httpStatus.BAD_REQUEST, "You are not allowed to update status!");
   }
}


if(payload.password){
  payload.password= await bcryptjs.hash(payload.password as string, envVars.BCRYPT_SALT_ROUND);
}


 const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {new:true, runValidators: true}  );


 return newUpdatedUser;
 
}



const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: { total: totalUsers },
  };
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser
};
