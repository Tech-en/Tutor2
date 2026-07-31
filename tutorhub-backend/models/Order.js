const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  academicLevel: { type: String, enum: ['highschool', 'college', 'graduate'], required: true },
  pages: { type: Number, required: true, min: 1 },
  deadline: { type: Date, required: true },
  description: String,
  files: [String],
  pricePerPage: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  cancellationReason: String,
  cancelledAt: Date
}, { timestamps: true });

orderSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
