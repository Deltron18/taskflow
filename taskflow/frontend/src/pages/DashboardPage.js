import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format, isPast } from 'date-fns';

const StatCard = ({ label, value, color, icon }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne' }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  </div>
);

const statusColors = { todo: 'var(--text-muted)', 'in-progress': 'var(--blue)', review: 'var(--amber)', done: 'var(--green)' };
const priorityColors = { low: 'var(--green)', medium: 'var(--blue)', high: 'var(--amber)', critical: 'var(--red)' };

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  const { stats, recentTasks, projects } = data || {};

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Here's what's happening across your projects</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Tasks" value={stats?.total ?? 0} color="#7c6ff7" icon="📋" />
        <StatCard label="In Progress" value={stats?.inProgress ?? 0} color="#4da8ff" icon="⚡" />
        <StatCard label="Completed" value={stats?.done ?? 0} color="#22c987" icon="✅" />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} color="#f06060" icon="⚠️" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Recent Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Tasks</h2>
            <Link to="/my-tasks" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
          </div>
          {recentTasks?.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Create a project to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks?.map(task => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[task.status], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ color: task.project?.color || 'var(--accent)' }}>● </span>
                      {task.project?.name}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className="badge" style={{ background: priorityColors[task.priority] + '20', color: priorityColors[task.priority] }}>{task.priority}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: 11, color: isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'var(--red)' : 'var(--text-muted)' }}>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects sidebar */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Projects</h2>
            <Link to="/projects" style={{ fontSize: 13, color: 'var(--accent)' }}>All →</Link>
          </div>
          {projects?.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <p>No projects yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projects?.map(p => (
                <Link key={p._id} to={`/projects/${p._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: 'var(--bg3)', borderRadius: 8, transition: 'background 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
