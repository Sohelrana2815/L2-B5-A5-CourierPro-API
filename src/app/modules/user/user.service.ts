import { IUser } from "./user.interface";
import User from "./user.model";

const createUser = (payload: Partial<IUser>) => {
  const { name, email, password } = payload;

  const user = User.create({
    name,
    email,
    password,
  });

  return user;
};

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
};
