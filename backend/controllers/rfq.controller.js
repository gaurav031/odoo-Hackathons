import RFQ from '../models/RFQ.js';
import AppError from '../utils/AppError.js';
import { logActivity } from '../utils/logger.js';

export const getAllRFQs = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'Vendor') {
      filter = { invitedVendors: req.user.vendorId };
    } else if (req.user.role === 'Manager') {
      filter = { createdBy: req.user._id };
    }

    const rfqs = await RFQ.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: rfqs.length,
      data: {
        rfqs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createRFQ = async (req, res, next) => {
  try {
    // Map uploaded files to paths
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Parse items and invitedVendors if they come as JSON strings from formData
    let items = req.body.items;
    let invitedVendors = req.body.invitedVendors;
    
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) {}
    }
    if (typeof invitedVendors === 'string') {
      try { invitedVendors = JSON.parse(invitedVendors); } catch (e) {}
    }

    // Inject the current user as creator
    const payload = {
      ...req.body,
      items,
      invitedVendors,
      attachments,
      createdBy: req.user._id,
    };

    const newRFQ = await RFQ.create(payload);

    await logActivity(
      'CREATED',
      'RFQ',
      newRFQ._id,
      req.user._id,
      `RFQ "${newRFQ.title}" was created with deadline ${new Date(newRFQ.deadline).toLocaleDateString()}`
    );

    res.status(201).json({
      status: 'success',
      data: {
        rfq: newRFQ,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRFQ = async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('invitedVendors', 'companyName email status');

    if (!rfq) {
      return next(new AppError('No RFQ found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        rfq,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRFQ = async (req, res, next) => {
  try {
    const rfq = await RFQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rfq) {
      return next(new AppError('No RFQ found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        rfq,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRFQ = async (req, res, next) => {
  try {
    const rfq = await RFQ.findByIdAndDelete(req.params.id);

    if (!rfq) {
      return next(new AppError('No RFQ found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
