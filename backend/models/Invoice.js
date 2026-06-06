import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    poId: {
      type: mongoose.Schema.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    items: [invoiceItemSchema],
    subTotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue'],
      default: 'Pending',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate invoices for the same PO
invoiceSchema.index({ poId: 1 }, { unique: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
