import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TaskModal = ({ task, projectId, members, onClose, onSave, userRole }) => {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    tags: task?.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        project: projectId,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null
      };

      let res;
      if (isEdit) {
        res = await api.put(`/tasks/${task._id}`, payload);
      } else {
        res = await api.post('/tasks', payload);
      }
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onSave(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700 }}>{isEdit ? 'Edit Task' : 'Create Task'}</h3>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Title *</label>
              <input className="input-field" placeholder="Task title" required value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="input-field" placeholder="Describe the task..." rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Assign To</label>
                <select className="input-field" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
                  <option value="">Unassigned</option>
                  {members?.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input className="input-field" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input className="input-field" placeholder="frontend, bug, urgent" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
