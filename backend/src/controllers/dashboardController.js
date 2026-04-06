import CarbonActivity from '../models/CarbonActivity.js';
import CarbonReduction from '../models/CarbonReduction.js';
import CarbonOffset from '../models/CarbonOffset.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const totalEmissions = await CarbonActivity.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: null, total: { $sum: '$co2_generated' } } }
    ]);

    const totalReductions = await CarbonReduction.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: null, total: { $sum: '$impact' } } }
    ]);

    const totalOffsets = await CarbonOffset.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: null, total: { $sum: '$credit_amount' } } }
    ]);

    const shareTransactions = await Transaction.aggregate([
      { $match: { from_user_id: userId, transaction_type: 'share' } },
      { $group: { _id: null, total: { $sum: '$credit_amount' } } }
    ]);

    const recentActivities = await Transaction.find({
      $or: [{ from_user_id: userId }, { to_user_id: userId }]
    })
      .sort({ created_at: -1 })
      .limit(10)
      .populate('from_user_id', 'name email')
      .populate('to_user_id', 'name email');

    res.status(200).json({
      current_balance: user.carbon_balance,
      total_emissions: totalEmissions[0]?.total || 0,
      total_reductions: totalReductions[0]?.total || 0,
      total_offsets: totalOffsets[0]?.total || 0,
      total_shared: shareTransactions[0]?.total || 0,
      recent_activities: recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find({
      $or: [{ from_user_id: userId }, { to_user_id: userId }]
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('from_user_id', 'name email')
      .populate('to_user_id', 'name email');

    const total = await Transaction.countDocuments({
      $or: [{ from_user_id: userId }, { to_user_id: userId }]
    });

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
