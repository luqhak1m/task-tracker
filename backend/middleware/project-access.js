import Project from '../models/Project.js';
import mongoose from 'mongoose';

export const ensureProjectExists = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: 'Invalid project id' });
  const project = await Project.findById(projectId).populate('owner members.user', 'name email');
  if (!project) return res.status(404).json({ error: 'Project not found' });
  req.project = project;
  next();
};

export const requireOwner = (req, res, next) => {
  const userId = String(req.userId);
  if (!req.project) return res.status(500).json({ error: 'Project not loaded' });

  // If owner is populated, get _id
  const ownerId = req.project.owner._id ? String(req.project.owner._id) : String(req.project.owner);

  if (ownerId !== userId) return res.status(403).json({ error: 'Owner permissions required' });
  next();
};

export const requireMemberOrOwner = (req, res, next) => {
  const userId = String(req.userId);
  if (!req.project) return res.status(500).json({ error: 'Project not loaded' });

  // check owner
  const ownerId = req.project.owner._id ? String(req.project.owner._id) : String(req.project.owner);
  if (ownerId === userId) return next();

  // check member
  const isMember = req.project.members.some(m => {
    const memberId = m.user._id ? String(m.user._id) : String(m.user);
    return memberId === userId;
  });

  if (!isMember) return res.status(403).json({ error: 'Project access required' });
  next();
};

