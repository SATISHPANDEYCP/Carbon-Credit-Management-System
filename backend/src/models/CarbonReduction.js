import mongoose from 'mongoose';

const carbonReductionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action_type: {
    type: String,
    required: true,
    enum: ['solar_installation', 'tree_planting', 'recycling', 'energy_efficiency']
  },
  impact: {
    type: Number,
    required: true
  },
  credits_earned: {
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

const CarbonReduction = mongoose.model('CarbonReduction', carbonReductionSchema);

export default CarbonReduction;
