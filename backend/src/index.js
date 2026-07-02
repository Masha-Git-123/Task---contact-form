const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;


const waitForDB = async (retries = 10) => {
  for (let i = 0; i < retries; i++) {
    try {
      await initDB();
      console.log(" Database connected");
      return;
    } catch (err) {
      console.log(`⏳ DB not ready, retrying... (${i + 1}/${retries})`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  throw new Error(" DB connection failed after retries");
};

waitForDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(` Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });