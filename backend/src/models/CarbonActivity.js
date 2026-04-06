import mongoose from 'mongoose';

const carbonActivitySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity_type: {
    type: String,
    required: true,
    enum: ['transport', 'electricity', 'waste', 'manufacturing']
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['km', 'kwh', 'kg', 'liters']
  },
  vehicle_type: {
    type: String,
    enum: ['car', 'bus', 'train', 'flight']
  },
  co2_generated: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const CarbonActivity = mongoose.model('CarbonActivity', carbonActivitySchema);

export default CarbonActivity;
