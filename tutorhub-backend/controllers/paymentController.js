const Payment = require('../models/Payment');
const Order = require('../models/Order');

function detectCardBrand(number) {
  const digits = String(number).replace(/\s/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6011/.test(digits)) return 'discover';
  return 'unknown';
}

// @desc    Process a payment for an order
// @route   POST /api/v1/payments/process
// @access  Private
// NOTE: no real payment gateway is wired up (no Stripe charge is created) — this
// records a simulated successful payment. Raw card number / CVV are never persisted,
// only a derived brand + last 4 digits, matching normal PCI-DSS practice.
exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, billingName, billingEmail, billingPhone, cardNumber } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'orderId and paymentMethod are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this order' });
    }

    const payment = await Payment.create({
      orderId: order._id,
      studentId: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      billingName,
      billingEmail,
      billingPhone,
      cardBrand: paymentMethod === 'paypal' ? undefined : detectCardBrand(cardNumber),
      cardLast4: paymentMethod === 'paypal' || !cardNumber ? undefined : String(cardNumber).replace(/\s/g, '').slice(-4),
      status: 'succeeded',
      paidAt: Date.now()
    });

    order.status = 'in-progress';
    await order.save();

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the current user's payments
// @route   GET /api/v1/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, sort = '-createdAt' } = req.query;

    const payments = await Payment.find({ studentId: req.user._id })
      .sort(sort)
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single payment
// @route   GET /api/v1/payments/:id
// @access  Private
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this payment' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment stats for the current user
// @route   GET /api/v1/payments/stats
// @access  Private
exports.getPaymentStats = async (req, res, next) => {
  try {
    const results = await Payment.aggregate([
      { $match: { studentId: req.user._id, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: 1 }, totalSpent: { $sum: '$amount' } } }
    ]);

    const stats = results[0]
      ? { total: results[0].total, completed: results[0].total, totalSpent: results[0].totalSpent }
      : { total: 0, completed: 0, totalSpent: 0 };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
