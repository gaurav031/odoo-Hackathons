import Approval from '../models/Approval.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import AppError from '../utils/AppError.js';

export const requestApproval = async (req, res, next) => {
  try {
    const { referenceId, referenceType, level } = req.body;

    // Check if an active approval request already exists
    const existingApproval = await Approval.findOne({
      referenceId,
      status: 'Pending',
    });

    if (existingApproval) {
      return next(new AppError('An approval request is already pending for this item.', 400));
    }

    const approval = await Approval.create({
      referenceId,
      referenceType,
      requesterId: req.user._id,
      level: level || 1,
    });

    res.status(201).json({
      status: 'success',
      data: {
        approval,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovals = async (req, res, next) => {
  try {
    const approvals = await Approval.find({ status: 'Pending' })
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: approvals.length,
      data: {
        approvals,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const takeAction = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return next(new AppError('Approval request not found', 404));
    }

    if (approval.status !== 'Pending') {
      return next(new AppError('This request has already been processed', 400));
    }

    approval.status = status;
    approval.remarks = remarks;
    approval.approverId = req.user._id;
    await approval.save();

    // Optionally update the underlying entity status
    if (status === 'Approved') {
      if (approval.referenceType === 'RFQ') {
        await RFQ.findByIdAndUpdate(approval.referenceId, { status: 'Open' });
      } else if (approval.referenceType === 'Quotation') {
        await Quotation.findByIdAndUpdate(approval.referenceId, { status: 'Approved' });
      }
    } else if (status === 'Rejected') {
      if (approval.referenceType === 'Quotation') {
        await Quotation.findByIdAndUpdate(approval.referenceId, { status: 'Rejected' });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        approval,
      },
    });
  } catch (error) {
    next(error);
  }
};
