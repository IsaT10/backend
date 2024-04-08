import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { Request, Response } from 'express';

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: any) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

const getUser = catchAsync(async (req: Request, res: Response, next: any) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: "This route doesn't exist. please use /signup instead!",
  });
};

const updateUser = catchAsync(
  async (req: Request, res: Response, next: any) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: any) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
);

export { getAllUsers, getUser, createUser, updateUser, deleteUser };
