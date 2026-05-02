import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const statusColors = { active: 'var(--green)', completed: 'var(--text-muted)', 'on-hold': 'var(--amber)' };

const ProjectCard = ({ project, onEdit, onDelete, userRole }) => {
  const isAdmin = userRole === 'admin' || project.owner?._id === project.owner;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Color bar */}
      <div style={{ height: 4, borderRadius: 4, background: project.color || 'var(--accent)', marginBottom: 4 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{project.name}</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          {isAdmin && (
            <>
              <button className="btn-icon" style={{ width: 28, height: 28, padding: 5 }} onClick={() => onEdit(project)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button className="btn-icon" style={{ width: 28, height: 28, padding: 5 }} onClick={() => onDelete(project._id)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {project.description && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{project.description}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: statusColors[project.status], textTransform: 'capitalize', fontWeight: 600 }}>
          ● {project.status}
        </span>
        {project.dueDate && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
        )}
      </div>

      {/* Members */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          {project.members?.slice(0, 5).map((m, i) => (
            <div key={m.user._id || i} className="avatar"
              style={{ width: 26, height: 26, fontSize: 10, marginLeft: i > 0 ? -6 : 0, border: '2px solid var(--bg2)', zIndex: 5 - i }}
              title={m.user.name}>
              {m.user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          ))}
          {project.members?.length > 5 && <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, marginLeft: -6 }}>+{project.members.length - 5}</div>}
        </div>

        <Link to={`/projects/${project._id}`} className="btn btn-secondary btn-sm">
          Open →
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
