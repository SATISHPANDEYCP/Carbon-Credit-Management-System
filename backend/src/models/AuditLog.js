import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  entity_type: {
    type: String
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  old_values: {
    type: mongoose.Schema.Types.Mixed
  },
  new_values: {
    type: mongoose.Schema.Types.Mixed
  },
  ip_address: {
    type: String
  },
  user_agent: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
