import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import User from "./user.model";

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    const user = await User.create({
      name,
      email,
    });

    res.status(httpStatus.CREATED).json({
      message: "User created successfully✅",
      user,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log(err);
    res.status(httpStatus.BAD_REQUEST).json({
      message: `Something went wrong! ${err.message}`,
      err,
    });
  }
};

export const UserControllers = {
  createUser,
};
