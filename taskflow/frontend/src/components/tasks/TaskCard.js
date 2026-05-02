import React from 'react';
import { format, isPast } from 'date-fns';

const priorityColors = { low: 'var(--green)', medium: 'var(--blue)', high: 'var(--amber)', critical: 'var(--red)' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, userRole, currentUserId }) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const initials = task.assignedTo?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const canEdit = userRole === 'admin' || task.assignedTo?._id === currentUserId || task.createdBy?._id === currentUserId;
  const canDelete = userRole === 'admin' || task.createdBy?._id === currentUserId;

  const nextStatus = { todo: 'in-progress', 'in-progress': 'review', review: 'done', done: 'todo' };

  return (
    <div className="card" style={{ padding: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>{task.title}</h4>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {canEdit && (
            <button className="btn-icon" style={{ width: 28, height: 28, padding: 5 }} onClick={() => onEdit(task)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}
          {canDelete && (
            <button className="btn-icon" style={{ width: 28, height: 28, padding: 5 }} onClick={() => onDelete(task._id)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {task.tags.map(tag => (
            <span key={tag} style={{ fontSize: 11, padding: '2px 7px', background: 'var(--bg3)', borderRadius: 20, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[task.priority], display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{task.priority}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.dueDate && (
            <span style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text-muted)' }}>
              {isOverdue ? '⚠ ' : ''}{format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.assignedTo && (
            <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }} title={task.assignedTo.name}>
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Status toggle */}
      <button onClick={() => onStatusChange(task._id, nextStatus[task.status])}
        style={{ marginTop: 10, width: '100%', padding: '6px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        Move to → {statusLabels[nextStatus[task.status]]}
      </button>
    </div>
  );
};

export default TaskCard;
