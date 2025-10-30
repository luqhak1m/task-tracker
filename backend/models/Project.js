
import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['member'], default: 'member' } // reserve for future roles
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [MemberSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
