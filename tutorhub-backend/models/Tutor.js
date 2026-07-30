/**
 * Tutor Model
 * 
 * Extended profile for users with tutor role
 * Manages subjects, availability, pricing, and tutor-specific information
 * 
 * @module models/Tutor
 */

const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema(
  {
    // Reference to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    
    // Professional Information
    title: {
      type: String,
      required: [true, 'Please provide a professional title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters']
    },
    bio: {
      type: String,
      required: [true, 'Please provide a bio'],
      minlength: [50, 'Bio must be at least 50 characters'],
      maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    
    // Education
    education: [{
      degree: {
        type: String,
        required: true
      },
      institution: {
        type: String,
        required: true
      },
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number,
      current: {
        type: Boolean,
        default: false
      }
    }],
    
    // Certifications
    certifications: [{
      name: {
        type: String,
        required: true
      },
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String
    }],
    
    // Teaching Experience
    experience: {
      years: {
        type: Number,
        required: [true, 'Please provide years of experience'],
        min: [0, 'Years of experience cannot be negative']
      },
      description: {
        type: String,
        maxlength: [1000, 'Experience description cannot exceed 1000 characters']
      }
    },
    
    // Subjects and Specializations
    subjects: [{
      name: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['elementary', 'middle-school', 'high-school', 'college', 'professional'],
        required: true
      },
      pricePerHour: {
        type: Number,
        required: true,
        min: [10, 'Price per hour must be at least $10']
      }
    }],
    
    // Languages
    languages: [{
      language: {
        type: String,
        required: true
      },
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        required: true
      }
    }],
    
    // Availability
    availability: {
      timezone: {
        type: String,
        default: 'America/New_York'
      },
      schedule: [{
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          required: true
        },
        slots: [{
          startTime: {
            type: String,
            required: true
          },
          endTime: {
            type: String,
            required: true
          },
          isAvailable: {
            type: Boolean,
            default: true
          }
        }]
      }]
    },
    
    // Pricing
    pricing: {
      hourlyRate: {
        type: Number,
        required: [true, 'Please provide hourly rate'],
        min: [10, 'Hourly rate must be at least $10']
      },
      currency: {
        type: String,
        default: 'USD'
      },
      packageDeals: [{
        name: String,
        hours: Number,
        price: Number,
        discount: Number
      }]
    },
    
    // Teaching Preferences
    preferences: {
      sessionTypes: [{
        type: String,
        enum: ['one-on-one', 'group', 'workshop']
      }],
      locations: [{
        type: String,
        enum: ['online', 'student-home', 'tutor-home', 'library', 'cafe']
      }],
      groupSize: {
        min: Number,
        max: Number
      }
    },
    
    // Verification and Status
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [{
      type: {
        type: String,
        enum: ['id', 'degree', 'certification', 'background-check']
      },
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    backgroundCheckStatus: {
      type: String,
      enum: ['not-submitted', 'pending', 'approved', 'rejected'],
      default: 'not-submitted'
    },
    backgroundCheckDate: Date,
    
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    
    // Statistics
    stats: {
      totalSessions: {
        type: Number,
        default: 0
      },
      completedSessions: {
        type: Number,
        default: 0
      },
      totalStudents: {
        type: Number,
        default: 0
      },
      totalEarnings: {
        type: Number,
        default: 0
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0
      },
      responseTime: {
        type: Number,
        default: 0
      },
      completionRate: {
        type: Number,
        default: 100
      }
    },
    
    // Video Introduction
    videoIntro: {
      url: String,
      thumbnail: String,
      duration: Number
    },
    
    // Social Links
    socialLinks: {
      linkedin: String,
      facebook: String,
      twitter: String,
      website: String
    },
    
    // Payment Information
    paymentInfo: {
      stripeAccountId: String,
      bankAccountLast4: String,
      payoutEnabled: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
tutorSchema.index({ userId: 1 });
tutorSchema.index({ 'subjects.name': 1 });
tutorSchema.index({ 'pricing.hourlyRate': 1 });
tutorSchema.index({ isVerified: 1, status: 1 });
tutorSchema.index({ 'stats.averageRating': -1 });

// Virtual for checking if profile is complete
tutorSchema.virtual('isProfileComplete').get(function() {
  return !!(
    this.title &&
    this.bio &&
    this.education.length > 0 &&
    this.subjects.length > 0 &&
    this.experience.years >= 0 &&
    this.pricing.hourlyRate > 0
  );
});

// Instance method to calculate average rating
tutorSchema.methods.calculateAverageRating = async function() {
  const Review = mongoose.model('Review');
  const result = await Review.aggregate([
    { $match: { tutorId: this._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length > 0) {
    this.stats.averageRating = Math.round(result[0].avgRating * 10) / 10;
    this.stats.totalReviews = result[0].count;
  } else {
    this.stats.averageRating = 0;
    this.stats.totalReviews = 0;
  }
  
  await this.save();
};

// Instance method to check availability for a time slot
tutorSchema.methods.isAvailable = function(day, startTime, endTime) {
  const daySchedule = this.availability.schedule.find(s => s.day === day.toLowerCase());
  
  if (!daySchedule) return false;
  
  return daySchedule.slots.some(slot => {
    return slot.isAvailable &&
           slot.startTime <= startTime &&
           slot.endTime >= endTime;
  });
};

// Static method to find available tutors by subject
tutorSchema.statics.findBySubject = async function(subjectName, level = null) {
  const query = {
    status: 'active',
    isVerified: true,
    'subjects.name': new RegExp(subjectName, 'i')
  };
  
  if (level) {
    query['subjects.level'] = level;
  }
  
  return await this.find(query).populate('userId', 'firstName lastName profilePicture email');
};

// Static method to get top-rated tutors
tutorSchema.statics.getTopRated = async function(limit = 10) {
  return await this.find({
    status: 'active',
    isVerified: true,
    'stats.averageRating': { $gte: 4.0 }
  })
    .sort({ 'stats.averageRating': -1, 'stats.totalReviews': -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName profilePicture');
};

module.exports = mongoose.model('Tutor', tutorSchema);
