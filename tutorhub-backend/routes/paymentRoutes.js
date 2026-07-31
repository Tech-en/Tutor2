const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/create-intent', protect, (req, res) => res.json({ success: true }));

router.post('/process', protect, paymentController.processPayment);
router.get('/stats', protect, paymentController.getPaymentStats);
router.get('/my-payments', protect, paymentController.getMyPayments);
router.get('/:id', protect, paymentController.getPaymentById);

module.exports = router;
