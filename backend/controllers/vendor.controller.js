import Vendor from '../models/Vendor.js';
import AppError from '../utils/AppError.js';

export const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: vendors.length,
      data: {
        vendors,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createVendor = async (req, res, next) => {
  try {
    const newVendor = await Vendor.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        vendor: newVendor,
      },
    });
  } catch (error) {
    // Handle unique constraint errors for company name or GST
    if (error.code === 11000) {
      return next(new AppError('Company name or GST Number already exists', 400));
    }
    next(error);
  }
};

export const getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return next(new AppError('No vendor found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        vendor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vendor) {
      return next(new AppError('No vendor found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        vendor,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Company name or GST Number already exists', 400));
    }
    next(error);
  }
};

export const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return next(new AppError('No vendor found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
