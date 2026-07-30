const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, (req, res) => res.json({ success: true }));
router.get('/tutor/:tutorId', (req, res) => res.json({ success: true, data: [] }));

module.exports = router;
