import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { ensureProjectExists, requireOwner, requireMemberOrOwner } from '../middleware/project-access.js';

const router = express.Router();

// Create project (owner = creator)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    // Only owners can create new projects
    const user = await User.findById(req.userId);
    if (user.role !== 'owner') return res.status(403).json({ error: 'Only owners can create projects' });

    const project = new Project({ title, description, owner: req.userId });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});


// Get projects owned by user or where user is member
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    }).populate('owner', 'name email').populate('members.user', 'name email');
;
    res.json(projects);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});

// Get single project (owner or member)
router.get('/:projectId', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  res.json(req.project);
});

// Update project (owner only)
router.put('/:projectId', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (title !== undefined) req.project.title = title;
    if (description !== undefined) req.project.description = description;
    await req.project.save();
    res.json(req.project);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// Delete project (owner only)
router.delete('/:projectId', requireAuth, ensureProjectExists, async (req, res) => {
  try {
    // Load the user from DB to check role
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Only owners can delete projects
    if (user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can delete projects' });
    }

    await Project.deleteOne({ _id: req.project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});



/* --- Members management (owner only) --- */

// Add member to project
router.post('/:projectId/members', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    // avoid duplicates
    if (req.project.members.some(m => String(m.user) === String(userId))) {
      return res.status(400).json({ error: 'User already member' });
    }
    req.project.members.push({ user: userId });
    await req.project.save();
    res.json(req.project);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// Remove member
router.delete('/:projectId/members/:memberId', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const memberId = req.params.memberId;
    req.project.members = req.project.members.filter(m => String(m.user) !== String(memberId));
    await req.project.save();
    res.json(req.project);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

export default router;
