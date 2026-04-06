import mongoose from 'mongoose';

const offsetProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  price_per_credit: {
    type: Number,
    required: true
  },
  credits_available: {
    type: Number,
    default: 0
  },
  project_type: {
    type: String,
    enum: ['reforestation', 'renewable_energy', 'carbon_capture']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const OffsetProject = mongoose.model('OffsetProject', offsetProjectSchema);

export default OffsetProject;
