// back/Routes/link_routes.js
const express = require('express');
const router = express.Router();
const linkCtrl = require('../Controllers/Link');

// POST /api/links
router.post('/', linkCtrl.createLink);

// GET /api/links
router.get('/', linkCtrl.getAllLinks);

// GET /api/links/:code
router.get('/:code', linkCtrl.getLinkStats);

// DELETE /api/links/:code
router.delete('/:code', linkCtrl.deleteLink);

module.exports = router;
