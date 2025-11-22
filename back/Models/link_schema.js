// back/Models/link_schema.js
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // unique here is sufficient
  target: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastClickedAt: { type: Date, default: null },
  totalClicks: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false }
});

// Do not declare the same index twice (avoid schema.index() for this field when using unique: true above).

module.exports = mongoose.model('Link', linkSchema);
