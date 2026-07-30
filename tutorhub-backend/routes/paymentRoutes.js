const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/create-intent', protect, (req, res) => res.json({ success: true }));

module.exports = router;
