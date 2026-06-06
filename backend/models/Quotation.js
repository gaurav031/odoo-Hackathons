import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative'],
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
  },
  total: {
    type: Number,
    required: true,
  },
});

const quotationSchema = new mongoose.Schema(
  {
    rfqId: {
      type: mongoose.Schema.ObjectId,
      ref: 'RFQ',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    items: [quotationItemSchema],
    grandTotal: {
      type: Number,
      required: true,
    },
    deliveryTimeline: {
      type: String,
      required: [true, 'Delivery timeline is required'],
    },
    terms: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Shortlisted', 'Rejected', 'Approved'],
      default: 'Submitted',
    },
  },
  { timestamps: true }
);

// Ensure one active quote per vendor per RFQ
quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
