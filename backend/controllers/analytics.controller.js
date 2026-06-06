import PurchaseOrder from '../models/PurchaseOrder.js';
import RFQ from '../models/RFQ.js';
import Invoice from '../models/Invoice.js';
import Vendor from '../models/Vendor.js';
import Quotation from '../models/Quotation.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const isVendor = req.user.role === 'Vendor';
    const vendorFilter = isVendor ? { vendorId: req.user.vendorId } : {};

    // 1. Basic Counts
    const activeRFQs = await RFQ.countDocuments({ status: 'Open' });
    const pendingApprovals = await Quotation.countDocuments({ status: 'Pending Approval' });
    const totalVendors = await Vendor.countDocuments({ status: 'Approved' });
    
    // Total PO Amount
    const poStats = await PurchaseOrder.aggregate([
      { $match: vendorFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const totalPoAmount = poStats.length > 0 ? poStats[0].total : 0;

    // 2. Monthly Spend (last 6 months based on POs)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpend = await PurchaseOrder.aggregate([
      { 
        $match: { 
          ...vendorFilter,
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          spend: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Map month numbers to names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySpend = monthlySpend.map(item => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      spend: item.spend
    }));

    // 3. Vendor Performance (Only for Admin/Manager)
    let vendorPerformance = [];
    if (!isVendor) {
      vendorPerformance = await PurchaseOrder.aggregate([
        {
          $group: {
            _id: '$vendorId',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' }
          }
        },
        {
          $lookup: {
            from: 'vendors',
            localField: '_id',
            foreignField: '_id',
            as: 'vendorDetails'
          }
        },
        { $unwind: '$vendorDetails' },
        {
          $project: {
            _id: 1,
            companyName: '$vendorDetails.companyName',
            rating: '$vendorDetails.rating',
            totalOrders: 1,
            totalSpent: 1
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]);
    }

    res.status(200).json({
      status: 'success',
      data: {
        counts: {
          activeRFQs,
          pendingApprovals,
          totalVendors,
          totalPoAmount
        },
        monthlySpend: formattedMonthlySpend,
        vendorPerformance
      }
    });

  } catch (error) {
    next(error);
  }
};
