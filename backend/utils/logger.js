import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (action, entityType, entityId, performedBy, details) => {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      performedBy,
      details,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
