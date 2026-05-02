import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#7c6ff7', '#22c987', '#4da8ff', '#f5a623', '#f06060', '#ec4899', '#14b8a6', '#f97316'];

const ProjectModal = ({ project, onClose, onSave }) => {
  const isEdit = !!project;
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    dueDate: project?.dueDate ? project.dueDate.split('T')[0] : '',
    color: project?.color || COLORS[0]
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await api.put(`/projects/${project._id}`, form);
      } else {
        res = await api.post('/projects', form);
      }
      toast.success(isEdit ? 'Project updated' : 'Project created');
      onSave(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700 }}>{isEdit ? 'Edit Project' : 'New Project'}</h3>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Project Name *</label>
              <input className="input-field" placeholder="My awesome project" required value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="input-field" placeholder="What's this project about?" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input className="input-field" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('color', c)} style={{
                    width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--text)' : '3px solid transparent',
                    cursor: 'pointer', transition: 'border-color 0.15s'
                  }} />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
