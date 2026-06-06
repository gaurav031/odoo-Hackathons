import mongoose from 'mongoose';

const rfqItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item must have a name'],
  },
  quantity: {
    type: Number,
    required: [true, 'Item must have a quantity'],
    min: [1, 'Quantity cannot be less than 1'],
  },
  specs: {
    type: String,
  },
});

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'RFQ must have a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'RFQ must have a description'],
    },
    items: [rfqItemSchema],
    invitedVendors: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
      },
    ],
    deadline: {
      type: Date,
      required: [true, 'RFQ must have a deadline'],
    },
    attachments: [
      {
        type: String, // Store file paths
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'Open', 'Closed', 'Awarded'],
      default: 'Open',
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate rfqNumber if not exists
rfqSchema.pre('validate', async function () {
  if (this.isNew && !this.rfqNumber) {
    // A simple generation logic, e.g. RFQ-YYYY-MM-<random 4 digits>
    // In a real production app, use an atomic counter collection.
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.rfqNumber = `RFQ-${dateStr}-${randomNum}`;
  }
});

const RFQ = mongoose.model('RFQ', rfqSchema);
export default RFQ;
