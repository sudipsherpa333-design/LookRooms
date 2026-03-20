import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import asyncHandler from 'express-async-handler';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    role: req.body.role || 'tenant'
  });

  createSendToken(newUser, 201, res);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    res.status(400);
    throw new Error('Please provide email/phone and password');
  }

  let user;
  if (email) {
    user = await User.findOne({ email }).select('+password');
  } else if (phone) {
    // Note: If phone is encrypted, we might need to handle this differently
    // For now, assuming the model handles the encryption/decryption on save/find
    user = await User.findOne({ phone }).select('+password');
  }

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Incorrect credentials');
  }

  createSendToken(user, 200, res);
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const updateMe = asyncHandler(async (req: any, res: Response) => {
  // 1) Create error if user POSTs password data
  if (req.body.password) {
    res.status(400);
    throw new Error('This route is not for password updates. Please use /updateMyPassword');
  }

  // 2) Filter out unwanted field names that are not allowed to be updated
  const filteredBody: any = {};
  const allowedFields = ['name', 'email', 'phone', 'avatar', 'payoutInfo'];
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
  });

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});
