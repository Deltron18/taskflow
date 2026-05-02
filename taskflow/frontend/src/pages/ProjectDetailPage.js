import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' }
];

const colColors = { todo: 'var(--text-muted)', 'in-progress': 'var(--blue)', review: 'var(--amber)', done: 'var(--green)' };

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const userRole = project?.members?.find(m => (m.user._id || m.user) === user._id || m.user._id === user._id)?.role || 'member';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?project=${id}`)
        ]);
        setProject(pRes.data.data);
        setTasks(tRes.data.data);
      } catch (err) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [id, navigate]);

  const handleTaskSave = (task) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t._id === task._id);
      if (idx >= 0) { const arr = [...prev]; arr[idx] = task; return arr; }
      return [...prev, task];
    });
    setShowTaskModal(false); setEditTask(null);
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) { toast.error('Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.data : t));
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await api.post(`/projects/${id}/members`, { email: inviteEmail, role: inviteRole });
      setProject(res.data.data);
      setInviteEmail('');
      toast.success('Member added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
    finally { setInviting(false); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data.data);
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove member'); }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await api.put(`/projects/${id}/members/${userId}`, { role });
      setProject(res.data.data);
      toast.success('Role updated');
    } catch (err) { toast.error('Failed to update role'); }
  };

  const filteredTasks = (status) => tasks.filter(t => {
    if (t.status !== status) return false;
    if (activeFilter === 'mine') return t.assignedTo?._id === user._id;
    return true;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: project?.color }} />
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>{project?.name}</h1>
            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: 'var(--bg3)', color: 'var(--text-muted)', textTransform: 'capitalize', border: '1px solid var(--border)' }}>{project?.status}</span>
          </div>
          {project?.description && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{project.description}</p>}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMembers(!showMembers)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Team ({project?.members?.length})
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Members panel */}
      {showMembers && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Team Members</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {project?.members?.map(m => (
              <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                <div className="avatar">{m.user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{m.user.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user.email}</p>
                </div>
                {userRole === 'admin' ? (
                  <select value={m.role} onChange={e => handleRoleChange(m.user._id, e.target.value)}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '4px 8px', fontSize: 12 }}>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span className={`badge badge-${m.role}`}>{m.role}</span>
                )}
                {userRole === 'admin' && m.user._id !== user._id && (
                  <button className="btn-icon" style={{ width: 28, height: 28, padding: 5 }} onClick={() => handleRemoveMember(m.user._id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {userRole === 'admin' && (
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input className="input-field" type="email" placeholder="Email address" required value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
              <select className="input-field" value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: 120 }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="btn btn-primary" disabled={inviting}>
                {inviting ? <span className="spinner" /> : 'Invite'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'mine'].map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} className="btn btn-sm"
            style={{ background: activeFilter === f ? 'var(--accent)' : 'var(--bg3)', color: activeFilter === f ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>
            {f === 'mine' ? 'My Tasks' : 'All Tasks'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, overflowX: 'auto' }}>
        {COLUMNS.map(col => {
          const colTasks = filteredTasks(col.key);
          return (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: colColors[col.key], display: 'inline-block' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 12, background: 'var(--bg3)', color: 'var(--text-muted)', padding: '2px 7px', borderRadius: 20 }}>{colTasks.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}>
                {colTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={(t) => { setEditTask(t); setShowTaskModal(true); }}
                    onDelete={handleTaskDelete}
                    onStatusChange={handleStatusChange}
                    userRole={userRole}
                    currentUserId={user._id}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editTask}
          projectId={id}
          members={project?.members}
          userRole={userRole}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
