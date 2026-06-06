import PurchaseOrder from '../models/PurchaseOrder.js';
import Quotation from '../models/Quotation.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/email.js';
import { logActivity } from '../utils/logger.js';

export const generatePO = async (req, res, next) => {
  try {
    const { quotationId } = req.body;

    const quotation = await Quotation.findById(quotationId).populate('rfqId');
    if (!quotation) {
      return next(new AppError('Quotation not found', 404));
    }

    if (quotation.status !== 'Approved') {
      return next(new AppError('Can only generate PO for an Approved Quotation', 400));
    }

    // Check if PO already exists for this quotation
    const existingPO = await PurchaseOrder.findOne({ quotationId });
    if (existingPO) {
      return res.status(200).json({
        status: 'success',
        message: 'PO already exists',
        data: { po: existingPO },
      });
    }

    const payload = {
      rfqId: quotation.rfqId._id,
      quotationId: quotation._id,
      vendorId: quotation.vendorId,
      items: quotation.items,
      totalAmount: quotation.grandTotal,
      deliveryTimeline: quotation.deliveryTimeline,
      terms: quotation.terms,
      createdBy: req.user._id,
      status: 'Sent', // Auto-send logic can be here, for now mark as Sent
    };

    const newPO = await PurchaseOrder.create(payload);

    await logActivity(
      'GENERATED',
      'PurchaseOrder',
      newPO._id,
      req.user._id,
      `Purchase Order generated for Quotation ${quotation._id} with amount ₹${newPO.totalAmount}`
    );

    res.status(201).json({
      status: 'success',
      data: {
        po: newPO,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPOs = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'Vendor') {
      filter = { vendorId: req.user.vendorId };
    } else if (req.user.role === 'Manager') {
      filter = { createdBy: req.user._id };
    }

    const pos = await PurchaseOrder.find(filter)
      .populate('vendorId', 'companyName email')
      .populate('rfqId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: pos.length,
      data: {
        pos,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePOStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Vendors can only Accept or Fulfill
    if (req.user.role === 'Vendor' && !['Accepted', 'Fulfilled'].includes(status)) {
      return next(new AppError('Vendors can only accept or fulfill a PO', 403));
    }

    const po = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!po) {
      return next(new AppError('No PO found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        po,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendPOEmail = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('vendorId', 'companyName email contactPerson')
      .populate('rfqId', 'title');

    if (!po) {
      return next(new AppError('No PO found with that ID', 404));
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Purchase Order Notification</h2>
        <p>Dear ${po.vendorId.contactPerson},</p>
        <p>A new Purchase Order (<strong>${po.poNumber}</strong>) has been generated for the RFQ: <em>${po.rfqId.title}</em>.</p>
        <p><strong>Total Amount:</strong> ₹${po.totalAmount.toLocaleString()}</p>
        <p>Please log in to the VendorBridge portal to review and accept the Purchase Order.</p>
        <br/>
        <p>Best regards,</p>
        <p>VendorBridge Procurement Team</p>
      </div>
    `;

    await sendEmail({
      email: po.vendorId.email,
      subject: `New Purchase Order: ${po.poNumber}`,
      message: `A new Purchase Order (${po.poNumber}) has been generated for you.`,
      html: emailHtml,
    });

    res.status(200).json({
      status: 'success',
      message: 'Email sent successfully to vendor',
    });
  } catch (error) {
    next(error);
  }
};
