const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  tutorEarnings: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['credit-card', 'debit-card', 'paypal', 'bank-transfer'], required: true },
  cardBrand: String,
  cardLast4: String,
  billingName: String,
  billingEmail: String,
  billingPhone: String,
  stripePaymentIntentId: String,
  status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
  paidAt: Date,
  refundedAt: Date,
  refundReason: String,
  transactionFee: Number
}, { timestamps: true });

paymentSchema.pre('validate', function requireOrderOrBooking(next) {
  if (!this.orderId && !this.bookingId) {
    return next(new Error('Payment must reference either an orderId or a bookingId'));
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
