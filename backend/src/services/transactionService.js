import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const createTransaction = async ({ 
  fromUserId, 
  toUserId, 
  transactionType, 
  creditAmount, 
  referenceId, 
  message,
  balanceAfter
}) => {
  const transaction = new Transaction({
    from_user_id: fromUserId || null,
    to_user_id: toUserId || null,
    transaction_type: transactionType,
    credit_amount: creditAmount,
    reference_id: referenceId,
    message,
    balance_after: balanceAfter
  });

  await transaction.save();
  return transaction;
};

export const updateUserBalance = async (userId, amount) => {
  const user = await User.findById(userId);
  user.carbon_balance += amount;
  await user.save();
  return user.carbon_balance;
};
