const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, requireProjectRole } = require('../middleware/auth');

// @route GET /api/projects — get all projects for user
router.get('/', protect, async (req, res, next) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
});

// @route POST /api/projects — create project
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Project name is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
});

// @route GET /api/projects/:projectId
router.get('/:projectId', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: project });
  } catch (err) { next(err); }
});

// @route PUT /api/projects/:projectId — update project (admin only)
router.put('/:projectId', protect, requireProjectRole(['admin']), [
  body('name').optional().trim().notEmpty()
], async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
});

// @route DELETE /api/projects/:projectId — delete project (admin only)
router.delete('/:projectId', protect, requireProjectRole(['admin']), async (req, res, next) => {
  try {
    await Task.deleteMany({ project: req.params.projectId });
    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
});

// @route POST /api/projects/:projectId/members — add member (admin only)
router.post('/:projectId/members', protect, requireProjectRole(['admin']), async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found with that email' });

    const project = req.project;
    const alreadyMember = project.members.some(m => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User is already a member' });

    project.members.push({ user: user._id, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'name email avatar');
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
});

// @route DELETE /api/projects/:projectId/members/:userId — remove member (admin only)
router.delete('/:projectId/members/:userId', protect, requireProjectRole(['admin']), async (req, res, next) => {
  try {
    const project = req.project;
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove project owner' });
    }
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('members.user', 'name email avatar');
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
});

// @route PUT /api/projects/:projectId/members/:userId — change role (admin only)
router.put('/:projectId/members/:userId', protect, requireProjectRole(['admin']), async (req, res, next) => {
  try {
    const project = req.project;
    const member = project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    member.role = req.body.role || member.role;
    await project.save();
    await project.populate('members.user', 'name email avatar');
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
});

module.exports = router;
