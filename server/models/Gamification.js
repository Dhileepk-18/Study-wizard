const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  badgeId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'award' },
  unlockedAt: { type: Date, default: Date.now }
});

const GamificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: '' },
    badges: [BadgeSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gamification', GamificationSchema);
