import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const initials = (name) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

function EditModal({ contact, onClose, onSaved }) {
  const [form, setForm] = useState({ ...contact });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.put(`/contacts/${contact.id}`, form);
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit contact</h2>
        <div style={{ background: 'var(--tag-bg)', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 2 }}>UUID (read-only)</div>
          <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--accent)', letterSpacing: '0.4px' }}>{contact.id}</div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          {['name', 'email', 'phone', 'address'].map((field) => (
            <div className="form-group" key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                name={field} type="text"
                value={form[field] || ''}
                onChange={handleChange}
                required={field === 'name'}
              />
            </div>
          ))}
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes || ''} onChange={handleChange} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContactDetail({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get(`/contacts/${id}`)
      .then((r) => setContact(r.data))
      .catch(() => setError('Contact not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const copyUUID = () => {
    navigator.clipboard.writeText(contact.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaved = (updated) => {
    setContact(updated);
    setShowEdit(false);
    setSuccessMsg('Contact updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/contacts/${id}`);
      navigate('/contacts');
    } catch {
      setError('Delete failed');
    }
  };

  const fmt = (dt) => new Date(dt).toLocaleString();

  if (loading) return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">Contact<span>Hub</span></div>
      </nav>
      <div className="main-content"><p style={{ color: 'var(--muted)' }}>Loading…</p></div>
    </div>
  );

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">Contact<span>Hub</span></div>
        <div className="navbar-right">
          <span className="navbar-user">👋 {user.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="main-content detail-page">
        <Link to="/contacts" className="back-btn">← Back to contacts</Link>

        {error && <div className="error-msg">{error}</div>}
        {successMsg && <div className="success-msg">✓ {successMsg}</div>}

        {contact && (
          <>
            <div className="detail-header">
              <div className="detail-avatar">{initials(contact.name)}</div>
              <div className="detail-title">
                <h1>{contact.name}</h1>

                {/* ── UUID Badge — copy on click ── */}
                <div
                  className="uuid-badge"
                  onClick={copyUUID}
                  title="Click to copy UUID"
                >
                  <span className="uuid-label">UUID</span>
                  {contact.id}
                  <span style={{ marginLeft: 4, fontSize: '0.7rem' }}>📋</span>
                </div>

                <div className="detail-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>
                    ✏️ Edit
                  </button>
                  {!deleteConfirm ? (
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
                      🗑 Delete
                    </button>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.82rem', color: 'var(--muted)', alignSelf: 'center' }}>Are you sure?</span>
                      <button className="btn btn-danger btn-sm" onClick={handleDelete}>Yes, delete</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="info-card">
              <h3>Contact information</h3>
              <div className="info-row">
                <span className="info-icon">✉</span>
                <span className={`info-val ${!contact.email ? 'muted' : ''}`}>
                  {contact.email || 'No email added'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-icon">📞</span>
                <span className={`info-val ${!contact.phone ? 'muted' : ''}`}>
                  {contact.phone || 'No phone added'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-icon">📍</span>
                <span className={`info-val ${!contact.address ? 'muted' : ''}`}>
                  {contact.address || 'No address added'}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="info-card">
              <h3>Notes</h3>
              <p style={{ color: contact.notes ? 'var(--text)' : 'var(--muted)', fontStyle: contact.notes ? 'normal' : 'italic', fontSize: '0.92rem' }}>
                {contact.notes || 'No notes added'}
              </p>
            </div>

            {/* Meta — UUID repeated in full */}
            <div className="info-card">
              <h3>Record details</h3>
              <div className="info-row" style={{ marginBottom: '0.5rem' }}>
                <span className="info-icon" style={{ fontSize: '0.85rem' }}>🆔</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--accent)', letterSpacing: '0.4px', wordBreak: 'break-all' }}>
                  {contact.id}
                </span>
              </div>
              <div className="meta-row" style={{ paddingLeft: '28px' }}>
                <span>Created: {fmt(contact.created_at)}</span>
                <span>Updated: {fmt(contact.updated_at)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {showEdit && contact && (
        <EditModal contact={contact} onClose={() => setShowEdit(false)} onSaved={handleSaved} />
      )}

      {copied && <div className="copied-toast">✓ UUID copied to clipboard</div>}
    </div>
  );
}
