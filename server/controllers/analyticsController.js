const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Gamification = require('../models/Gamification');
const StudentProfile = require('../models/StudentProfile');

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await StudySession.find({ userId });
    const subjects = await Subject.find({ userId });
    const exams = await Exam.find({ userId });
    const gamification = (await Gamification.findOne({ userId })) || { xp: 0, level: 1, currentStreak: 0, longestStreak: 0, coins: 0, badges: [] };
    const profile = await StudentProfile.findOne({ userId });

    // 1. Total & Daily Study Hours
    const totalMinutesStudied = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalHours = (totalMinutesStudied / 60).toFixed(1);
    const avgDailyHours = sessions.length > 0 ? (totalHours / Math.max(1, new Set(sessions.map(s => new Date(s.completedAt).toISOString().split('T')[0])).size)).toFixed(1) : 0;

    // 2. Subject Breakdown for Pie/Bar charts
    const subjectMap = {};
    subjects.forEach(sub => {
      subjectMap[sub.name] = { name: sub.name, minutes: 0, color: sub.color || '#6C63FF' };
    });

    sessions.forEach(s => {
      if (subjectMap[s.subjectName]) {
        subjectMap[s.subjectName].minutes += s.durationMinutes;
      } else {
        subjectMap[s.subjectName] = { name: s.subjectName, minutes: s.durationMinutes, color: '#4F8EF7' };
      }
    });

    const subjectBreakdown = Object.values(subjectMap);
    const sortedByMinutes = [...subjectBreakdown].sort((a, b) => b.minutes - a.minutes);
    const mostStudied = sortedByMinutes[0]?.name || 'N/A';
    const leastStudied = sortedByMinutes[sortedByMinutes.length - 1]?.name || 'N/A';

    // 3. Syllabus completion percentage
    let totalTopics = 0;
    let completedTopics = 0;
    subjects.forEach(sub => {
      if (sub.units) {
        sub.units.forEach(u => {
          if (u.topics) {
            totalTopics += u.topics.length;
            completedTopics += u.topics.filter(t => t.completed).length;
          }
        });
      }
    });
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // 4. Daily Hours Trend for Line Chart (Last 7 Days)
    const last7DaysTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const daySessions = sessions.filter(s => new Date(s.completedAt).toISOString().split('T')[0] === dateStr);
      const dayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

      last7DaysTrend.push({
        date: dateStr,
        day: dayName,
        hours: parseFloat((dayMinutes / 60).toFixed(1)),
        target: profile ? profile.dailyAvailableHours : 4
      });
    }

    // 5. Weak & Strong Areas
    const weakAreas = [];
    const strongAreas = [];
    subjects.forEach(sub => {
      let subTotal = 0;
      let subCompleted = 0;
      if (sub.units) {
        sub.units.forEach(u => {
          if (u.topics) {
            subTotal += u.topics.length;
            subCompleted += u.topics.filter(t => t.completed).length;
          }
        });
      }
      const ratio = subTotal > 0 ? subCompleted / subTotal : 0;
      if (ratio < 0.4 || sub.difficulty === 'Hard') {
        weakAreas.push({ subject: sub.name, reason: `${sub.difficulty} difficulty & low completion (${Math.round(ratio * 100)}%)` });
      } else {
        strongAreas.push({ subject: sub.name, reason: `High completion (${Math.round(ratio * 100)}%)` });
      }
    });

    // 6. AI Recommendations
    const recommendations = subjects.length > 0 ? [
      `Dedicate 45 mins extra to ${weakAreas[0]?.subject || subjects[0]?.name} before your upcoming exam.`,
      `Maintain your study momentum by completing at least 1 Pomodoro session today!`,
      `Keep reviewing syllabus topics using spaced repetition.`
    ] : [
      'Add your first subject to receive AI personalized recommendations.'
    ];

    res.json({
      totalHours,
      avgDailyHours,
      mostStudied,
      leastStudied,
      completionPercentage,
      totalTopics,
      completedTopics,
      last7DaysTrend,
      subjectBreakdown,
      gamification,
      weakAreas,
      strongAreas,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };
