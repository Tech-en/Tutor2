const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  tutorEarnings: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'bank'], required: true },
  stripePaymentIntentId: String,
  status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
  paidAt: Date,
  refundedAt: Date,
  refundReason: String,
  transactionFee: Number
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
