import { promisify } from 'util';
import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const signToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = catchAsync(async (req: Request, res: Response, next: any) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

const login = catchAsync(async (req: Request, res: Response, next: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user: any = await User.findOne({ email }).select('+password -__v');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
  });
});

const protect = catchAsync(async (req: Request, res: Response, next: any) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  /*
   else if (req.cookies?.jwt) {
      token = req.cookies.jwt
   }
   */

  //    check token
  if (!token) {
    return next(
      new AppError('You are not logged in! please log in to get access', 401)
    );
  }

  //   verify token

  const decoded: JwtPayload = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as JwtPayload;

  //   check user is still exists
  const currentUser: any = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  //   check if user changed password after the token was issued
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }

  // grant access to protected route
  (req as any).user = currentUser;

  next();
});

const restricTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return next(
        new AppError('You do not have premission to performe this action', 403)
      );
    }

    next();
  };
};

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    /* Get user based on POSTED email */
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('There is no user with this email address', 404)
      );
    }

    /*Generate the random reset token */
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
  }
);

export { signup, login, protect, restricTo, forgotPassword };
