import mongoose from 'mongoose';

const carbonOffsetSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OffsetProject',
    required: true
  },
  credit_amount: {
    type: Number,
    required: true
  },
  price_per_credit: {
    type: Number,
    required: true
  },
  total_cost: {
    type: Number,
    required: true
  },
  transaction_id: {
    type: String,
    unique: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const CarbonOffset = mongoose.model('CarbonOffset', carbonOffsetSchema);

export default CarbonOffset;
