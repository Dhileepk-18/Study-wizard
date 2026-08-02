const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  estimatedMinutes: { type: Number, default: 45 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  completed: { type: Boolean, default: false },
  revisionCount: { type: Number, default: 0 },
  lastRevisedAt: { type: Date },
  nextRevisionAt: { type: Date },
  notes: { type: String, default: '' }
});

const UnitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  unitNumber: { type: Number, default: 1 },
  topics: [TopicSchema]
});

const SubjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    code: { type: String, required: true },
    credits: { type: Number, default: 4 },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    color: { type: String, default: '#6C63FF' },
    priority: { type: Number, default: 5 }, // 1 to 10
    professorName: { type: String, default: '' },
    notes: { type: String, default: '' },
    units: [UnitSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
