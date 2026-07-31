const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', protect, upload.array('files'), orderController.createOrder);
router.get('/stats', protect, orderController.getOrderStats);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id', protect, orderController.updateOrder);
router.delete('/:id', protect, orderController.cancelOrder);

module.exports = router;
