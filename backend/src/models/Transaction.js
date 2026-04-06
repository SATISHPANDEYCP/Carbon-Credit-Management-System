import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  from_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  to_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transaction_type: {
    type: String,
    required: true,
    enum: ['measure', 'reduce', 'offset', 'share']
  },
  credit_amount: {
    type: Number,
    required: true
  },
  reference_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  message: {
    type: String
  },
  balance_after: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
