const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    subjectName: { type: String, required: true },
    examName: { type: String, required: true },
    examDate: { type: Date, required: true },
    examTime: { type: String, default: '10:00 AM' },
    examType: {
      type: String,
      enum: ['CAT', 'FAT', 'Quiz', 'Assignment', 'Lab'],
      default: 'CAT'
    },
    maximumMarks: { type: Number, default: 100 },
    targetMarks: { type: Number, default: 85 },
    importanceLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'High'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', ExamSchema);
