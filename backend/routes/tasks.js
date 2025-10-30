import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { ensureProjectExists, requireOwner, requireMemberOrOwner } from '../middleware/project-access.js';

const router = express.Router({ mergeParams: true });

/**
 * GET tasks for a project with filtering, sorting, pagination:
 * /api/projects/:projectId/tasks?status=todo&assignedTo=<id>&sort=createdAt:desc&page=1&limit=10
 */
// GET tasks for a project
router.get('/:projectId/tasks', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  try {
    const { status, sort = 'createdAt:desc', page = 1, limit = 10 } = req.query;
    const projectId = req.params.projectId;
    const userId = req.userId;

    const filter = { project: projectId };
    
    // ROLE FILTER
    const user = await User.findById(userId);
    const isOwner = user.role === 'owner';
    if (!isOwner) {
      filter.assignedTo = userId; // members see only their tasks
    }

    if (status) filter.status = status;

    const [sortField, sortDir] = sort.split(':');
    const sortObj = { [sortField]: sortDir === 'desc' ? -1 : 1 };

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const tasks = await Task.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedTo', 'name email');

    const total = await Task.countDocuments(filter);

    res.json({ tasks, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


// Create task (owner only) — Owner assigns tasks to members
router.post('/:projectId/tasks', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    // ensure assignedTo is either null or a member of project
    if (assignedTo) {
        const isMember =
            req.project.members.some(m => String(m.user._id) === String(assignedTo)) ||
            String(req.project.owner._id) === String(assignedTo);
    if (!isMember) return res.status(400).json({ error: 'assignedTo must be owner or member of project' });
    }

    const task = new Task({ title, description, assignedTo: assignedTo || null, status: status || 'todo', priority: priority || 'medium', project: req.project._id });
    await task.save();
    res.status(201).json(task);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// Member or owner can update a task (members allowed to update tasks)
router.put('/:projectId/tasks/:taskId', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findOne({ _id: taskId, project: req.project._id });
    if (!task) return res.status(404).json({ error: 'task not found' });

    // If member, restrict what they can update (e.g., status and description)
    const isOwner = String(req.project.owner) === String(req.userId);
    if (!isOwner) {
      // only allow updating status, description, maybe priority
      const allowed = ['status', 'description'];
      for (const key of Object.keys(req.body)) {
        if (!allowed.includes(key)) return res.status(403).json({ error: 'Members cannot modify this field' });
      }
    }

    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// Delete task (owner only)
router.delete('/:projectId/tasks/:taskId', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, project: req.project._id });
    if (!task) return res.status(404).json({ error: 'task not found' });
    res.json({ message: 'task deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

export default router;
