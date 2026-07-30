const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  subject: { type: String, required: true },
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
  notes: String,
  materials: [{ name: String, url: String, uploadedAt: Date }],
  homework: String,
  studentAttendance: { type: Boolean, default: false },
  tutorAttendance: { type: Boolean, default: false },
  sessionSummary: String,
  nextTopics: [String]
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
