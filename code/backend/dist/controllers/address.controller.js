"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddressFromExtension = exports.createAddress = exports.getAddresses = void 0;
const address_service_1 = require("../services/address.service");
const AppError_1 = require("../utils/AppError");
const getAddresses = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const response = await address_service_1.addressService.getAddresses(req.user.id);
        res.status(200).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
const createAddress = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const response = await address_service_1.addressService.createAddress(req.user.id, req.body);
        res.status(201).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAddress = createAddress;
const createAddressFromExtension = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const response = await address_service_1.addressService.createAddressFromExtension(req.user.id, req.body);
        res.status(response.created ? 201 : 200).json({
            success: true,
            data: response.data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAddressFromExtension = createAddressFromExtension;
const updateAddress = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const addressId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
        if (!addressId) {
            next(new AppError_1.AppError('Address id is required', 400));
            return;
        }
        const response = await address_service_1.addressService.updateAddress(addressId, req.user.id, req.body);
        res.status(200).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const addressId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
        if (!addressId) {
            next(new AppError_1.AppError('Address id is required', 400));
            return;
        }
        const response = await address_service_1.addressService.deleteAddress(addressId, req.user.id);
        res.status(200).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
