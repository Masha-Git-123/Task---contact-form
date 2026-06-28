const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

// GET /api/contacts — list all contacts for logged-in user
const getContacts = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/contacts/:id — get single contact by UUID
const getContact = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM contacts WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Contact not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/contacts — create contact
const createContact = async (req, res) => {
  const { name, email, phone, address, notes } = req.body;
  if (!name)
    return res.status(400).json({ error: 'Name is required' });

  try {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO contacts (id, user_id, name, email, phone, address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, req.userId, name, email || null, phone || null, address || null, notes || null]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM contacts WHERE id = ?', [id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/contacts/:id — update contact by UUID
const updateContact = async (req, res) => {
  const { name, email, phone, address, notes } = req.body;

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM contacts WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (existing.length === 0)
      return res.status(404).json({ error: 'Contact not found' });

    await pool.execute(
      `UPDATE contacts SET name=?, email=?, phone=?, address=?, notes=?
       WHERE id = ? AND user_id = ?`,
      [name, email || null, phone || null, address || null, notes || null,
       req.params.id, req.userId]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM contacts WHERE id = ?', [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/contacts/:id — delete contact by UUID
const deleteContact = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM contacts WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getContacts, getContact, createContact, updateContact, deleteContact };
