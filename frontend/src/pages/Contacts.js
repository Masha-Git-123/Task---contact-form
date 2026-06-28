import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const initials = (name) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

function ContactModal({ onClose, onSaved, existing }) {
  const [form, setForm] = useState(
    existing || { name: '', email: '', phone: '', address: '', notes: '' }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (existing) {
        const res = await api.put(`/contacts/${existing.id}`, form);
        data = res.data;
      } else {
        const res = await api.post('/contacts', form);
        data = res.data;
      }
      onSaved(data, !!existing);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{existing ? 'Edit contact' : 'New contact'}</h2>
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
                placeholder={field === 'name' ? 'Required' : 'Optional'}
              />
            </div>
          ))}
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes || ''} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? 'Saving…' : existing ? 'Update contact' : 'Add contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Contacts({ user, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contacts')
      .then((r) => setContacts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (contact, isUpdate) => {
    if (isUpdate) {
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));
    } else {
      setContacts((prev) => [contact, ...prev]);
    }
    setShowModal(false);
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
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

      <div className="main-content">
        <div className="page-header">
          <h1>Contacts <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '1rem' }}>({contacts.length})</span></h1>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
            + New contact
          </button>
        </div>

        <div className="search-bar">
          <span style={{ color: 'var(--muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading contacts…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>{search ? 'No results found' : 'No contacts yet'}</h3>
            <p>{search ? 'Try a different search.' : 'Click "+ New contact" to add your first contact.'}</p>
          </div>
        ) : (
          <div className="contacts-grid">
            {filtered.map((c) => (
              <Link to={`/contacts/${c.id}`} className="contact-card" key={c.id}>
                <div className="contact-avatar">{initials(c.name)}</div>
                <h3>{c.name}</h3>
                {c.email && <div className="contact-email">✉ {c.email}</div>}
                {c.phone && <div className="contact-phone">📞 {c.phone}</div>}
                <div className="contact-uuid">UUID: {c.id}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ContactModal onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}
