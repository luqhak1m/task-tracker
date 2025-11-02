import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { ensureProjectExists, requireOwner, requireMemberOrOwner } from '../middleware/project-access.js';
import mongoose from 'mongoose';
import Activity from '../models/Activity.js';

const router = express.Router();

const extractUserIds = members =>
  members.map(m => (m.user && m.user._id ? m.user._id : m.user)).filter(Boolean);

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const user = await User.findById(req.userId);
    if (!user || user.role !== 'owner')
      return res.status(403).json({ error: 'Only owners can create projects' });

    const project = new Project({ title, description, owner: req.userId });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:projectId', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  res.json(req.project);
});

router.put('/:projectId', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (title !== undefined) req.project.title = title;
    if (description !== undefined) req.project.description = description;
    await req.project.save();
    res.json(req.project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.delete('/:projectId', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    await Project.deleteOne({ _id: req.project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


router.post('/:projectId/members', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const memberIds = req.project.members.map(m =>
      m.user && m.user._id ? String(m.user._id) : String(m.user)
    );
    if (memberIds.includes(String(userId))) {
      return res.status(400).json({ error: 'User already a member' });
    }

    req.project.members.push({ user: userId });
    await req.project.save();

    const updatedProject = await req.project.populate('owner members.user', 'name email');

    res.json(updatedProject);
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

router.delete('/:projectId/members/:memberId', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const memberId = req.params.memberId;

    req.project.members = req.project.members.filter(m => {
      const id = m.user._id ? String(m.user._id) : String(m.user);
      return id !== memberId;
    });
    await req.project.save();

    const updatedProject = await req.project.populate('owner members.user', 'name email');
    res.json(updatedProject);
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:projectId/available-users', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const memberIds = extractUserIds(req.project.members);
    const users = await User.find({ _id: { $nin: memberIds } }).select('name email role');
    res.json(users);
  } catch (err) {
    console.error('Available users error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/available-users/all', requireAuth, async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:projectId/activity', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50); // latest 50 actions
    res.json(activities);
  } catch (err) {
    console.error('Fetch activity error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
