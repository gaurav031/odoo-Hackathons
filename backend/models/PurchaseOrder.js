import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
      required: true,
    },
    rfqId: {
      type: mongoose.Schema.ObjectId,
      ref: 'RFQ',
      required: true,
    },
    quotationId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quotation',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    items: [poItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryTimeline: {
      type: String,
    },
    terms: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Fulfilled'],
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate poNumber
purchaseOrderSchema.pre('validate', async function () {
  if (this.isNew && !this.poNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.poNumber = `PO-${dateStr}-${randomNum}`;
  }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrder;
