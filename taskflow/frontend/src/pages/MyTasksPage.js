import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const statusColors = { todo: 'var(--text-muted)', 'in-progress': 'var(--blue)', review: 'var(--amber)', done: 'var(--green)' };
const priorityColors = { low: 'var(--green)', medium: 'var(--blue)', high: 'var(--amber)', critical: 'var(--red)' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks/my')
      .then(res => setTasks(res.data.data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.data : t));
      toast.success('Status updated');
    } catch (err) { toast.error('Failed to update'); }
  };

  const filtered = filter === 'all' ? tasks :
    filter === 'overdue' ? tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done') :
    tasks.filter(t => t.status === filter);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>My Tasks</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>Tasks assigned to you across all projects</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'todo', label: 'To Do' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'review', label: 'Review' },
          { key: 'done', label: 'Done' },
          { key: 'overdue', label: '⚠ Overdue' }
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className="btn btn-sm"
            style={{ background: filter === f.key ? 'var(--accent)' : 'var(--bg3)', color: filter === f.key ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks here</h3>
          <p>Tasks assigned to you will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(task => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div key={task._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {/* Status dot */}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[task.status], flexShrink: 0 }} />

                {/* Task info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{task.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12 }}>
                      <span style={{ color: task.project?.color || 'var(--accent)' }}>●  </span>
                      <span style={{ color: 'var(--text-muted)' }}>{task.project?.name}</span>
                    </span>
                    <span style={{ fontSize: 12, color: priorityColors[task.priority], fontWeight: 600 }}>{task.priority}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text-muted)' }}>
                        {isOverdue ? '⚠ Due ' : 'Due '}{format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status changer */}
                <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                  style={{ padding: '6px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }}>
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
