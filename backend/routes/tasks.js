import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js'; // 🆕 ADD THIS
import { requireAuth } from '../middleware/auth.js';
import { ensureProjectExists, requireOwner, requireMemberOrOwner } from '../middleware/project-access.js';

const router = express.Router({ mergeParams: true });

/**
 * GET tasks for a project with filtering, sorting, pagination
 */
router.get('/:projectId/tasks', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  try {
    const { status, assignedTo, search, sort = 'createdAt:desc', page = 1, limit = 10 } = req.query;
    const { projectId } = req.params;
    const userId = req.userId;

    const filter = { project: projectId };

    // Restrict members to their own tasks
    const user = await User.findById(userId);
    const isOwner = user.role === 'owner';
    if (!isOwner) {
      filter.assignedTo = userId;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [sortField, sortDir] = sort.split(':');
    const sortDirection = sortDir === 'desc' ? -1 : 1;

    let allTasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .lean();

    if (sortField === 'priority') {
      const priorityWeight = { high: 1, medium: 2, low: 3 };
      allTasks.sort((a, b) => (priorityWeight[a.priority] - priorityWeight[b.priority]) * sortDirection);
    } else if (sortField === 'status') {
      const statusWeight = { todo: 1, 'in-progress': 2, done: 3 };
      allTasks.sort((a, b) => (statusWeight[a.status] - statusWeight[b.status]) * sortDirection);
    } else {
      allTasks.sort((a, b) => {
        if (a[sortField] > b[sortField]) return sortDirection;
        if (a[sortField] < b[sortField]) return -sortDirection;
        return 0;
      });
    }

    const perPage = Math.max(1, Number(limit));
    const currentPage = Math.max(1, Number(page));
    const total = allTasks.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const tasks = allTasks.slice(start, end);

    res.json({
      tasks,
      meta: { total, page: currentPage, limit: perPage, totalPages }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// 🆕 Create task (owner only)
router.post('/:projectId/tasks', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    if (assignedTo) {
      const isMember =
        req.project.members.some(m => String(m.user._id) === String(assignedTo)) ||
        String(req.project.owner._id) === String(assignedTo);
      if (!isMember) return res.status(400).json({ error: 'assignedTo must be owner or member of project' });
    }

    const task = new Task({
      title,
      description,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      priority: priority || 'medium',
      project: req.project._id
    });

    await task.save();

    // 🆕 Add activity log
    await Activity.create({
      project: req.project._id,
      user: req.userId,
      action: 'created task',
      details: `Created task "${task.title}"`,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// 🆕 Update task (members can only update "status")
router.put('/:projectId/tasks/:taskId', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({ _id: taskId, project: req.project._id });
    if (!task) return res.status(404).json({ error: 'task not found' });

    const isOwner = String(req.project.owner._id) === String(req.userId);

    if (!isOwner) {
      const allowed = ['status'];
      for (const key of Object.keys(req.body)) {
        if (!allowed.includes(key)) {
          return res.status(403).json({ error: 'Members can only update task status' });
        }
      }
    }

    const oldStatus = task.status;
    Object.assign(task, req.body);
    await task.save();

    // 🆕 Add activity log
    const changes = [];
    if (req.body.status && req.body.status !== oldStatus)
      changes.push(`status: ${oldStatus} → ${req.body.status}`);
    if (req.body.description)
      changes.push('updated description');
    if (changes.length > 0) {
      await Activity.create({
        project: req.project._id,
        user: req.userId,
        action: 'updated task',
        details: `Updated "${task.title}" (${changes.join(', ')})`,
      });
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// 🆕 Delete task (owner only)
router.delete('/:projectId/tasks/:taskId', requireAuth, ensureProjectExists, requireOwner, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, project: req.project._id });
    if (!task) return res.status(404).json({ error: 'task not found' });

    // 🆕 Add activity log
    await Activity.create({
      project: req.project._id,
      user: req.userId,
      action: 'deleted task',
      details: `Deleted task "${task.title}"`,
    });

    res.json({ message: 'task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// 🆕 Get project activity logs
router.get('/:projectId/activities', requireAuth, ensureProjectExists, requireMemberOrOwner, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.project._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50); // show most recent 50

    res.json(activities);
  } catch (err) {
    console.error('Failed to fetch activities', err);
    res.status(500).json({ error: 'server error' });
  }
});


export default router;
