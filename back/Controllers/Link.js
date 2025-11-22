// back/Controllers/Link.js
const Link = require('../Models/link_schema');
const validator = require('validator');

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

/**
 * Try to generate a unique code with several attempts and progressive length.
 * Throws if unable to produce a unique code.
 */
async function generateUniqueCode(maxAttempts = 8) {
  const lengths = [6,6,6,7,7,8,8,8];
  for (let i = 0; i < Math.min(maxAttempts, lengths.length); i++) {
    const code = generateRandomCode(lengths[i]);
    const exists = await Link.findOne({ code }).lean();
    if (!exists) return code;
  }
  throw new Error('Unable to generate unique code after multiple attempts');
}

/**
 * Create a new short link.
 * Body: { target: string, code?: string }
 */
exports.createLink = async (req, res) => {
  try {
    let { target, code } = req.body;
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ error: 'Missing target URL.' });
    }

    target = target.trim();

    // Disallow dangerous schemes
    const forbiddenSchemes = ['javascript:', 'data:'];
    if (forbiddenSchemes.some(s => target.toLowerCase().startsWith(s))) {
      return res.status(400).json({ error: 'Invalid URL scheme.' });
    }

    if (!validator.isURL(target, { require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid target URL. Include protocol (http/https).' });
    }

    let finalCode = code ? String(code).trim() : undefined;

    // Custom code provided: validate and ensure uniqueness
    if (finalCode) {
      if (!CODE_REGEX.test(finalCode)) {
        return res.status(400).json({ error: 'Custom code must be 6-8 alphanumeric characters.' });
      }
      const exists = await Link.findOne({ code: finalCode }).lean();
      if (exists) return res.status(409).json({ error: 'Code already exists' });
    } else {
      // Auto-generate a unique code
      try {
        finalCode = await generateUniqueCode(8);
      } catch (err) {
        return res.status(500).json({ error: 'Unable to generate unique code. Try again later.' });
      }
    }

    // Attempt to save the new link, retry on duplicate-key (race) a few times
    let newLink = null;
    let attempts = 0;
    const MAX_SAVE_ATTEMPTS = 4;

    while (attempts < MAX_SAVE_ATTEMPTS) {
      try {
        newLink = new Link({ code: finalCode, target });
        await newLink.save();
        break;
      } catch (err) {
        const isDupKey = err && (err.code === 11000 || (err.message && err.message.includes('duplicate key')));
        if (isDupKey) {
          attempts++;
          try {
            finalCode = await generateUniqueCode(4);
          } catch (innerErr) {
            return res.status(500).json({ error: 'Unable to generate unique code after collision. Try again.' });
          }
          continue;
        }
        console.error('Link save error:', err);
        return res.status(500).json({ error: 'Server error while creating link.' });
      }
    }

    if (!newLink) {
      return res.status(500).json({ error: 'Could not create link, please try again.' });
    }

    // Build path-only and absolute short URL
    const shortPath = `/${newLink.code}`;
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${newLink.code}`;

    res.status(201)
      .location(shortPath)
      .json({
        code: newLink.code,
        target: newLink.target,
        createdAt: newLink.createdAt,
        lastClickedAt: newLink.lastClickedAt,
        totalClicks: newLink.totalClicks,
        shortPath, // e.g. "/Abc123"
        shortUrl   // e.g. "https://short.example.com/Abc123"
      });
  } catch (err) {
    console.error('createLink unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * List all non-deleted links
 */
exports.getAllLinks = async (req, res) => {
  try {
    const links = await Link.find({ deleted: false }).sort({ createdAt: -1 }).lean();
    return res.json(links);
  } catch (err) {
    console.error('getAllLinks error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get stats for a single code
 */
exports.getLinkStats = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).json({ error: 'Missing code param' });

    const link = await Link.findOne({ code }).lean();
    if (!link) return res.status(404).json({ error: 'Not found' });

    return res.json(link);
  } catch (err) {
    console.error('getLinkStats error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete (soft-delete) a link by code
 */
exports.deleteLink = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).json({ error: 'Missing code param' });

    const link = await Link.findOne({ code });
    if (!link) return res.status(404).json({ error: 'Not found' });

    link.deleted = true;
    await link.save();

    return res.json({ ok: true });
  } catch (err) {
    console.error('deleteLink error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
