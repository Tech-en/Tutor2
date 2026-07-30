const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  categories: {
    knowledge: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    patience: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 }
  },
  wouldRecommend: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ tutorId: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
