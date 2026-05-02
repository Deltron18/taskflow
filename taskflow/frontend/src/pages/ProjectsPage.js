import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSave = (project) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p._id === project._id);
      if (idx >= 0) { const arr = [...prev]; arr[idx] = project; return arr; }
      return [project, ...prev];
    });
    setShowModal(false); setEditProject(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) { toast.error('Failed to delete project'); }
  };

  const handleEdit = (project) => { setEditProject(project); setShowModal(true); };

  const getUserRole = (project) => {
    const m = project.members?.find(m => (m.user._id || m.user) === user._id);
    return m?.role || 'member';
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project to start organizing tasks</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <ProjectCard key={p._id} project={p} onEdit={handleEdit} onDelete={handleDelete} userRole={getUserRole(p)} />
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
