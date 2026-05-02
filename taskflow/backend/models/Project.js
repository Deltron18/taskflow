const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  dueDate: { type: Date },
  color: { type: String, default: '#6366f1' }
}, { timestamps: true });

// Ensure owner is always in members as admin
projectSchema.pre('save', function (next) {
  const ownerExists = this.members.some(
    m => m.user.toString() === this.owner.toString()
  );
  if (!ownerExists) {
    this.members.push({ user: this.owner, role: 'admin' });
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
