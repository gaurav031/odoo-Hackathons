import Invoice from '../models/Invoice.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/email.js';
import { logActivity } from '../utils/logger.js';

export const generateInvoice = async (req, res, next) => {
  try {
    const { poId, invoiceNumber, dueDate, notes } = req.body;

    const po = await PurchaseOrder.findById(poId);
    if (!po) {
      return next(new AppError('Purchase Order not found', 404));
    }

    // A Vendor can only invoice against a PO assigned to them, and ideally if it's Accepted/Fulfilled
    if (req.user.role === 'Vendor' && po.vendorId.toString() !== req.user.vendorId.toString()) {
      return next(new AppError('You do not have permission to invoice this PO', 403));
    }

    if (!['Accepted', 'Fulfilled'].includes(po.status)) {
      return next(new AppError('Cannot invoice a PO that is not accepted or fulfilled', 400));
    }

    // Calculate totals based on PO items
    let subTotal = 0;
    let taxAmount = 0;
    
    po.items.forEach(item => {
      subTotal += (item.unitPrice * item.quantity);
      taxAmount += item.tax || 0;
    });

    const totalAmount = subTotal + taxAmount;

    const newInvoice = await Invoice.create({
      invoiceNumber,
      poId,
      vendorId: po.vendorId,
      items: po.items,
      subTotal,
      taxAmount,
      totalAmount,
      dueDate,
      notes,
    });

    await logActivity(
      'CREATED',
      'Invoice',
      newInvoice._id,
      req.user._id,
      `Invoice ${newInvoice.invoiceNumber} submitted for PO ${po.poNumber} with total ₹${newInvoice.totalAmount}`
    );

    res.status(201).json({
      status: 'success',
      data: {
        invoice: newInvoice,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Invoice already exists for this PO or duplicate Invoice Number.', 400));
    }
    next(error);
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Vendor' ? { vendorId: req.user.vendorId } : {};

    const invoices = await Invoice.find(filter)
      .populate('vendorId', 'companyName')
      .populate('poId', 'poNumber status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: {
        invoices,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendInvoiceEmail = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendorId', 'companyName email contactPerson')
      .populate('poId', 'poNumber');

    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice Submitted</h2>
        <p>An invoice (<strong>${invoice.invoiceNumber}</strong>) has been submitted by <em>${invoice.vendorId.companyName}</em> for Purchase Order: ${invoice.poId.poNumber}.</p>
        <p><strong>Total Amount:</strong> ₹${invoice.totalAmount.toLocaleString()}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p>Please log in to the VendorBridge portal to review and process payment.</p>
        <br/>
        <p>VendorBridge ERP System</p>
      </div>
    `;

    // Assuming the email is sent to the Admin or Finance team. 
    // We will just use a placeholder admin email for now or send it to the vendor as confirmation.
    await sendEmail({
      email: 'finance@vendorbridge.com', // In a real app, query for finance users
      subject: `New Invoice Submitted: ${invoice.invoiceNumber}`,
      message: `Invoice ${invoice.invoiceNumber} has been submitted by ${invoice.vendorId.companyName}.`,
      html: emailHtml,
    });

    res.status(200).json({
      status: 'success',
      message: 'Invoice email sent successfully to Finance',
    });
  } catch (error) {
    next(error);
  }
};
