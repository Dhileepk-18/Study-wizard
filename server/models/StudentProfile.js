const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    college: { type: String, default: 'National Institute of Tech' },
    department: { type: String, default: 'Computer Science & Engineering' },
    semester: { type: String, default: '6th Semester' },
    year: { type: String, default: '3rd Year' },
    learningStyle: {
      type: String,
      enum: ['Visual', 'Auditory', 'Reading', 'Practical'],
      default: 'Visual'
    },
    dailyAvailableHours: { type: Number, default: 4, min: 1, max: 16 },
    preferredStudyTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'Evening'
    },
    studyGoal: {
      dailyGoal: { type: Number, default: 4 }, // hours
      weeklyGoal: { type: Number, default: 24 },
      monthlyGoal: { type: Number, default: 90 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
