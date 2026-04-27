import { NextFunction, Request, Response } from 'express';

import { authService } from '../services/auth.service';
import {
  clearAuthCookie,
  clearRefreshCookie,
  getRefreshTokenFromCookieHeader,
  setAuthCookie,
  setRefreshCookie,
} from '../utils/authCookie';
import { AppError } from '../utils/AppError';

function sendAuthenticatedSession(
  res: Response,
  result: Awaited<ReturnType<typeof authService.loginUser>>,
  statusCode: number,
): void {
  setAuthCookie(res, result.token);
  setRefreshCookie(res, result.refreshToken);

  res.status(statusCode).json({
    success: true,
    data: {
      token: result.token,
      user: result.user,
    },
  });
}

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    sendAuthenticatedSession(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    sendAuthenticatedSession(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = getRefreshTokenFromCookieHeader(req.headers.cookie);

    if (!refreshToken) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const result = await authService.refreshUserSession(refreshToken);
    sendAuthenticatedSession(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getCurrentAuthenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthenticatedUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthenticatedUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    await authService.changePassword(req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: {
        success: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    clearAuthCookie(res);
    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      data: {
        success: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
