const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Helper: check if user is project member
const getProjectAndRole = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, role: null };
  const member = project.members.find(m => m.user.toString() === userId.toString());
  return { project, role: member ? member.role : null };
};

// @route GET /api/tasks?project=id — get tasks for a project
router.get('/', protect, async (req, res, next) => {
  try {
    const { project: projectId, status, priority, assignedTo } = req.query;
    if (!projectId) return res.status(400).json({ success: false, message: 'Project ID required' });

    const { role } = await getProjectAndRole(projectId, req.user._id);
    if (!role) return res.status(403).json({ success: false, message: 'Access denied' });

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('order createdAt');

    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

// @route GET /api/tasks/my — get tasks assigned to current user
router.get('/my', protect, async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .sort('-updatedAt');
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

// @route GET /api/tasks/dashboard — dashboard stats
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id name color');
    const projectIds = userProjects.map(p => p._id);

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
      })
    ]);

    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('assignedTo', 'name avatar')
      .sort('-updatedAt')
      .limit(8);

    res.json({
      success: true,
      data: { stats: { total, todo, inProgress, done, overdue }, recentTasks, projects: userProjects }
    });
  } catch (err) { next(err); }
});

// @route POST /api/tasks — create task
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').notEmpty().withMessage('Project is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  try {
    const { role } = await getProjectAndRole(req.body.project, req.user._id);
    if (!role) return res.status(403).json({ success: false, message: 'Access denied' });

    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
});

// @route PUT /api/tasks/:id — update task
router.put('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { role } = await getProjectAndRole(task.project, req.user._id);
    if (!role) return res.status(403).json({ success: false, message: 'Access denied' });

    // Members can only update status if not assigned to them and not admin
    if (role === 'member' && task.assignedTo?.toString() !== req.user._id.toString()) {
      const allowedFields = ['status'];
      Object.keys(req.body).forEach(key => {
        if (!allowedFields.includes(key)) delete req.body[key];
      });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// @route DELETE /api/tasks/:id — delete task (admin or creator)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { role } = await getProjectAndRole(task.project, req.user._id);
    if (!role) return res.status(403).json({ success: false, message: 'Access denied' });
    if (role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admins or task creator can delete' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
