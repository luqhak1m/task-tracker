import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Activity', ActivitySchema);
