import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    referenceId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      // Could point to either an RFQ or Quotation
    },
    referenceType: {
      type: String,
      required: true,
      enum: ['RFQ', 'Quotation'],
    },
    requesterId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    approverId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      // If null, it means it's available for any user with 'Approver' role
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    remarks: {
      type: String,
    },
    level: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Approval = mongoose.model('Approval', approvalSchema);
export default Approval;
