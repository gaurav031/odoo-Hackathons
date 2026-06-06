import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // e.g., 'CREATED', 'UPDATED', 'APPROVED', 'REJECTED', 'DELETED', 'SENT'
    },
    entityType: {
      type: String,
      required: true,
      enum: ['RFQ', 'Quotation', 'Approval', 'PurchaseOrder', 'Invoice', 'Vendor', 'User'],
    },
    entityId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    details: {
      type: String,
      required: true,
      // e.g., 'RFQ Q3 Hardware was created'
    },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
