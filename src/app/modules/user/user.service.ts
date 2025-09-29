import { IUser } from "./user.interface";
import User from "./user.model";

const createUser = (payload: Partial<IUser>) => {
  const { name, email } = payload;

  const user = User.create({
    name,
    email,
  });

  return user;
};

const getAllUsers = async () => {
  const user = await User.find({});
  return user;
};

export const UserServices = {
  createUser,
  getAllUsers,
};
