import { NextFunction, Request, Response } from 'express';

import { addressService } from '../services/address.service';
import { AppError } from '../utils/AppError';

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const response = await addressService.getAddresses(req.user.id);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const response = await addressService.createAddress(req.user.id, req.body);

    res.status(201).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const createAddressFromExtension = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const response = await addressService.createAddressFromExtension(
      req.user.id,
      req.body,
    );

    res.status(response.created ? 201 : 200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const addressId =
      typeof req.params.id === 'string' ? req.params.id.trim() : '';

    if (!addressId) {
      next(new AppError('Address id is required', 400));
      return;
    }

    const response = await addressService.updateAddress(
      addressId,
      req.user.id,
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

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }

    const addressId =
      typeof req.params.id === 'string' ? req.params.id.trim() : '';

    if (!addressId) {
      next(new AppError('Address id is required', 400));
      return;
    }

    const response = await addressService.deleteAddress(addressId, req.user.id);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
