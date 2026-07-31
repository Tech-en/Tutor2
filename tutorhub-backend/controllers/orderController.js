const Order = require('../models/Order');

// @desc    Create an order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { subject, topic, academicLevel, pages, deadline, description, pricePerPage, totalAmount } = req.body;

    if (!subject || !topic || !academicLevel || !pages || !deadline || !pricePerPage || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Missing required order fields' });
    }

    const order = await Order.create({
      studentId: req.user._id,
      subject,
      topic,
      academicLevel,
      pages: parseInt(pages, 10),
      deadline,
      description,
      pricePerPage: parseFloat(pricePerPage),
      totalAmount: parseFloat(totalAmount),
      files: (req.files || []).map((f) => f.path)
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the current user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, sort = '-createdAt', limit = 20, page = 1 } = req.query;

    const filter = { studentId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort(sort)
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an order (only while still pending)
// @route   PUT /api/v1/orders/:id
// @access  Private
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be updated' });
    }

    const updatable = ['topic', 'subject', 'academicLevel', 'pages', 'deadline', 'description', 'pricePerPage', 'totalAmount'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) order[field] = req.body[field];
    });

    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   DELETE /api/v1/orders/:id
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason;
    order.cancelledAt = Date.now();
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order stats for the current user
// @route   GET /api/v1/orders/stats
// @access  Private
exports.getOrderStats = async (req, res, next) => {
  try {
    const results = await Order.aggregate([
      { $match: { studentId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = { total: 0, pending: 0, 'in-progress': 0, completed: 0, cancelled: 0 };
    results.forEach((r) => {
      stats[r._id] = r.count;
      stats.total += r.count;
    });

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
