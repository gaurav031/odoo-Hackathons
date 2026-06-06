import ActivityLog from '../models/ActivityLog.js';

export const getActivities = async (req, res, next) => {
  try {
    // If vendor, only show activities performed by them or related to their entities (simplified to just their actions for now)
    const filter = req.user.role === 'Vendor' ? { performedBy: req.user._id } : {};

    const limit = parseInt(req.query.limit) || 50;

    const activities = await ActivityLog.find(filter)
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: activities.length,
      data: {
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};
