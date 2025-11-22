// back/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./db');
const linkRoutes = require('./Routes/link_routes');
const Link = require('./Models/link_schema');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to DB (exit if cannot connect)
connectDB().catch(err => {
  console.error('Failed to connect to DB:', err);
  process.exit(1);
});

// Healthcheck
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, version: '1.0' });
});

// API routes
app.use('/api/links', linkRoutes);

// Redirect handler (after API)
// GET /:code -> 302 redirect or 404
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    const link = await Link.findOne({ code, deleted: false });
    if (!link) return res.status(404).json({ error: 'Not found' });

    link.totalClicks = (link.totalClicks || 0) + 1;
    link.lastClickedAt = new Date();

    try {
      await link.save();
    } catch (saveErr) {
      console.error('Warning: failed to update click count for', code, saveErr);
      // continue with redirect even if save fails
    }

    return res.redirect(302, link.target);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TinyLink backend listening on port ${PORT}`);
});
