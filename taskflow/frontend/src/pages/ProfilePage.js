import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [loading, setLoading] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>Manage your account settings</p>
      </div>

      <div className="card">
        {/* Avatar section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>{initials}</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input-field" value={user?.email} disabled style={{ opacity: 0.6 }} />
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Email cannot be changed</p>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Account Info</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>Member since</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>User ID</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{user?._id?.slice(-8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
