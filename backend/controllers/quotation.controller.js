import Quotation from '../models/Quotation.js';
import Vendor from '../models/Vendor.js';
import AppError from '../utils/AppError.js';

export const submitQuotation = async (req, res, next) => {
  try {
    // Calculate totals for items
    let grandTotal = 0;
    const itemsWithTotals = req.body.items.map((item) => {
      const tax = item.tax || 0;
      const total = item.quantity * item.unitPrice + tax;
      grandTotal += total;
      return { ...item, total };
    });

    // If testing as an Admin/Manager, grab the first vendor in the DB to associate with the quote
    let vendorIdToUse = req.user.vendorId;
    if (!vendorIdToUse && ['Admin', 'Manager'].includes(req.user.role)) {
      const anyVendor = await Vendor.findOne();
      if (!anyVendor) return next(new AppError('No vendors exist in the system to test quoting.', 400));
      vendorIdToUse = anyVendor._id;
    }

    if (!vendorIdToUse) {
      return next(new AppError('You are not associated with any vendor profile.', 403));
    }

    const payload = {
      ...req.body,
      vendorId: vendorIdToUse,
      items: itemsWithTotals,
      grandTotal,
    };

    const quotation = await Quotation.create(payload);

    res.status(201).json({
      status: 'success',
      data: {
        quotation,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You have already submitted a quotation for this RFQ.', 400));
    }
    next(error);
  }
};

export const getQuotationsByRFQ = async (req, res, next) => {
  try {
    const quotations = await Quotation.find({ rfqId: req.params.rfqId })
      .populate('vendorId', 'companyName rating contactPerson')
      .sort({ grandTotal: 1 }); // Sort by lowest price by default

    res.status(200).json({
      status: 'success',
      results: quotations.length,
      data: {
        quotations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuotationStatus = async (req, res, next) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!quotation) {
      return next(new AppError('No quotation found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        quotation,
      },
    });
  } catch (error) {
    next(error);
  }
};
