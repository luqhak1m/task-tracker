
import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo','in-progress','done'], default: 'todo' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
}, { timestamps: true });

// add an index to speed queries by project + status + createdAt for sorting/pagination
TaskSchema.index({ project: 1, status: 1, createdAt: -1 });

export default mongoose.model('Task', TaskSchema);
