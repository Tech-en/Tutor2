const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  subject: { type: String, required: true },
  sessionType: { type: String, enum: ['one-on-one', 'group'], default: 'one-on-one' },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  location: { type: String, enum: ['online', 'in-person'], default: 'online' },
  meetingLink: String,
  address: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  price: { type: Number, required: true },
  notes: String,
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date
}, { timestamps: true });

bookingSchema.index({ studentId: 1, date: -1 });
bookingSchema.index({ tutorId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
