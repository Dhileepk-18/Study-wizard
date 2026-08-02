const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    subjectName: { type: String, required: true },
    topicName: { type: String, default: 'General Study' },
    durationMinutes: { type: Number, required: true },
    focusScore: { type: Number, default: 90 }, // 0 to 100
    distractionCount: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
    isRevision: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudySession', StudySessionSchema);
