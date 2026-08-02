const StudySession = require('../models/StudySession');
const Gamification = require('../models/Gamification');
const Notification = require('../models/Notification');

// Record study session and reward XP/Coins/Badges
const logSession = async (req, res) => {
  try {
    const { subjectId, subjectName, topicName, durationMinutes, focusScore, distractionCount, isRevision } = req.body;

    const session = await StudySession.create({
      userId: req.user._id,
      subjectId,
      subjectName: subjectName || 'General Study',
      topicName: topicName || 'General Topic',
      durationMinutes: durationMinutes || 25,
      focusScore: focusScore || 90,
      distractionCount: distractionCount || 0,
      isRevision: isRevision || false
    });

    // Award Gamification Rewards
    let gamification = await Gamification.findOne({ userId: req.user._id });
    if (!gamification) {
      gamification = await Gamification.create({ userId: req.user._id });
    }

    const xpEarned = Math.round(durationMinutes * 2 * (focusScore / 100));
    const coinsEarned = Math.round(durationMinutes / 5);

    gamification.xp += xpEarned;
    gamification.coins += coinsEarned;

    // Check level up (100 XP per level)
    const newLevel = Math.floor(gamification.xp / 200) + 1;
    let leveledUp = false;
    if (newLevel > gamification.level) {
      gamification.level = newLevel;
      leveledUp = true;

      await Notification.create({
        userId: req.user._id,
        title: 'Level Up! 🎉',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'achievement'
      });
    }

    // Check streak
    const todayStr = new Date().toISOString().split('T')[0];
    if (gamification.lastActiveDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (gamification.lastActiveDate === yesterdayStr) {
        gamification.currentStreak += 1;
      } else {
        gamification.currentStreak = 1;
      }
      gamification.lastActiveDate = todayStr;
      if (gamification.currentStreak > gamification.longestStreak) {
        gamification.longestStreak = gamification.currentStreak;
      }
    }

    // Check 7 day streak badge
    if (gamification.currentStreak >= 7 && !gamification.badges.some(b => b.badgeId === 'streak_7')) {
      gamification.badges.push({
        badgeId: 'streak_7',
        title: '7 Day Streak 🔥',
        description: 'Studied for 7 consecutive days',
        icon: 'flame'
      });
    }

    // Check First Session badge
    if (!gamification.badges.some(b => b.badgeId === 'first_session')) {
      gamification.badges.push({
        badgeId: 'first_session',
        title: 'First Focus Session',
        description: 'Completed your first study session',
        icon: 'target'
      });
    }

    await gamification.save();

    res.status(201).json({
      session,
      gamification,
      xpEarned,
      coinsEarned,
      leveledUp
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get session history
const getSessionHistory = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id }).sort({ completedAt: -1 }).limit(30);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  logSession,
  getSessionHistory
};
