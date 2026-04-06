import CarbonActivity from '../models/CarbonActivity.js';
import CarbonReduction from '../models/CarbonReduction.js';
import CarbonOffset from '../models/CarbonOffset.js';
import OffsetProject from '../models/OffsetProject.js';
import User from '../models/User.js';
import { calculateCO2, calculateCreditsEarned } from '../services/carbonCalculator.js';
import { createTransaction, updateUserBalance } from '../services/transactionService.js';
import crypto from 'crypto';

export const measureEmission = async (req, res) => {
  try {
    const { activity_type, quantity, unit, vehicle_type, description } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!activity_type || !quantity || !unit) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const co2Generated = calculateCO2(activity_type, quantity, unit, vehicle_type);

    const activity = new CarbonActivity({
      user_id: userId,
      activity_type,
      quantity,
      unit,
      vehicle_type,
      co2_generated: co2Generated,
      description: description?.trim()
    });

    await activity.save();

    // Get user's current balance
    const user = await User.findById(userId);
    const currentBalance = user.carbon_balance;

    // Create transaction only after successful save
    await createTransaction({
      fromUserId: userId,
      toUserId: null,
      transactionType: 'measure',
      creditAmount: co2Generated,
      referenceId: activity._id,
      message: `Measured ${activity_type} - ${quantity} ${unit}`,
      balanceAfter: currentBalance
    });

    res.status(201).json({
      message: 'Carbon emission recorded',
      id: activity._id,
      carbon_emitted: co2Generated,
      new_balance: currentBalance,
      timestamp: activity.created_at
    });
  } catch (error) {
    console.error('Measure emission error:', error);
    res.status(500).json({ message: error.message || 'Failed to record emission' });
  }
};

export const getEmissionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from_date, to_date } = req.query;

    let query = { user_id: userId };

    if (from_date && to_date) {
      query.created_at = {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      };
    }

    const activities = await CarbonActivity.find(query).sort({ created_at: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logReduction = async (req, res) => {
  try {
    const { action_type, impact, description } = req.body;
    const userId = req.user._id;

    const creditsEarned = calculateCreditsEarned(impact);

    const reduction = new CarbonReduction({
      user_id: userId,
      action_type,
      impact,
      credits_earned: creditsEarned,
      description: description?.trim()
    });

    await reduction.save();

    const newBalance = await updateUserBalance(userId, creditsEarned);

    // Format action type to readable text
    const formattedAction = action_type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    await createTransaction({
      fromUserId: null,
      toUserId: userId,
      transactionType: 'reduce',
      creditAmount: creditsEarned,
      referenceId: reduction._id,
      message: `Reduction activity: ${formattedAction}`,
      balanceAfter: newBalance
    });

    res.status(201).json({
      message: 'Reduction activity recorded',
      id: reduction._id,
      credits_earned: creditsEarned,
      new_balance: newBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const purchaseOffset = async (req, res) => {
  try {
    const { credit_amount, project_id } = req.body;
    const userId = req.user._id;

    // Validate credit amount
    if (!credit_amount || credit_amount <= 0) {
      return res.status(400).json({ message: 'Credit amount must be greater than 0' });
    }

    const project = await OffsetProject.findById(project_id);
    if (!project || !project.is_active) {
      return res.status(404).json({ message: 'Project not found or inactive' });
    }

    // Check if project has enough credits available
    if (project.credits_available < credit_amount) {
      return res.status(400).json({ 
        message: `Insufficient credits available. Only ${project.credits_available} credits remaining.` 
      });
    }

    const totalCost = credit_amount * project.price_per_credit;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const offset = new CarbonOffset({
      user_id: userId,
      project_id,
      credit_amount,
      price_per_credit: project.price_per_credit,
      total_cost: totalCost,
      transaction_id: transactionId
    });

    await offset.save();

    // Decrease project's available credits
    project.credits_available -= credit_amount;
    await project.save();

    const newBalance = await updateUserBalance(userId, credit_amount);

    await createTransaction({
      fromUserId: null,
      toUserId: userId,
      transactionType: 'offset',
      creditAmount: credit_amount,
      referenceId: offset._id,
      message: `Offset purchase from ${project.name}`,
      balanceAfter: newBalance
    });

    res.status(201).json({
      message: 'Offset purchase successful',
      transaction_id: transactionId,
      credits_purchased: credit_amount,
      total_cost: totalCost,
      new_balance: newBalance,
      project: {
        name: project.name,
        credits_remaining: project.credits_available
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOffsetProjects = async (req, res) => {
  try {
    const projects = await OffsetProject.find({ is_active: true });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shareCredits = async (req, res) => {
  try {
    const { recipient_email, credit_amount, message } = req.body;
    const userId = req.user._id;

    // Trim and lowercase recipient email
    const trimmedRecipientEmail = recipient_email?.trim().toLowerCase();

    const sender = await User.findById(userId);
    if (sender.carbon_balance < credit_amount) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    const recipient = await User.findOne({ email: trimmedRecipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: 'Cannot share credits with yourself' });
    }

    await updateUserBalance(userId, -credit_amount);
    await updateUserBalance(recipient._id, credit_amount);

    // Get updated balance for sender
    const updatedSender = await User.findById(userId);
    const senderBalance = updatedSender.carbon_balance;

    // Format share message
    const shareMessage = message && message.trim() 
      ? `Shared to ${trimmedRecipientEmail}: ${message.trim()}`
      : `Shared credits to ${trimmedRecipientEmail}`;

    const transaction = await createTransaction({
      fromUserId: userId,
      toUserId: recipient._id,
      transactionType: 'share',
      creditAmount: credit_amount,
      referenceId: null,
      message: shareMessage,
      balanceAfter: senderBalance
    });

    res.status(201).json({
      message: 'Credits shared successfully',
      transaction_id: transaction._id,
      credits_shared: credit_amount,
      new_balance: senderBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
