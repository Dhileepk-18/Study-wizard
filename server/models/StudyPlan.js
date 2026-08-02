const mongoose = require('mongoose');

const StudyPlanBlockSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String, required: true },
  subjectColor: { type: String, default: '#6C63FF' },
  topicName: { type: String, required: true },
  unitName: { type: String, default: 'Unit 1' },
  durationMinutes: { type: Number, default: 45 },
  scheduledTime: { type: String, default: '09:00 AM' },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed', 'overdue'],
    default: 'pending'
  },
  isRevision: { type: Boolean, default: false },
  revisionStage: { type: Number, default: 0 }, // 1, 2, 3, 4 for 1d, 3d, 7d, 15d
  priorityScore: { type: Number, default: 0 }
});

const StudyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    blocks: [StudyPlanBlockSchema],
    totalMinutes: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
