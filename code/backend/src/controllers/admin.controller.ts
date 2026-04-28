import { NextFunction, Request, Response } from 'express';

import { adminService } from '../services/admin.service';
import { AppError } from '../utils/AppError';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const response = await adminService.getUsers();

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const response = await adminService.createAdmin(req.body);

    res.status(201).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const userId = typeof req.params.id === 'string' ? req.params.id.trim() : '';

    if (!userId) {
      next(new AppError('User id is required', 400));
      return;
    }

    const response = await adminService.updateUserAccount(userId, req.body);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const userId = typeof req.params.id === 'string' ? req.params.id.trim() : '';

    if (!userId) {
      next(new AppError('User id is required', 400));
      return;
    }

    const response = await adminService.updateUserStatus(
      req.user.id,
      userId,
      req.body,
    );

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};
