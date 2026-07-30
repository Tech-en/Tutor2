const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/my-sessions', protect, (req, res) => res.json({ success: true, data: [] }));

module.exports = router;
