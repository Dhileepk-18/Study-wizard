const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const { getSubjects, createSubject, updateSubject, deleteSubject, toggleTopicCompletion } = require('../controllers/subjectController');
const { getExams, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { getOrGenerateSchedule, seedSampleData, forceReschedule, updateBlockStatus } = require('../controllers/scheduleController');
const { logSession, getSessionHistory } = require('../controllers/sessionController');
const { getAnalytics } = require('../controllers/analyticsController');
const { askChatbot } = require('../controllers/chatbotController');
const { exportDataCSV } = require('../controllers/exportController');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Auth
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/profile', protect, getProfile);
router.put('/auth/profile', protect, updateProfile);

// Subjects & Syllabus
router.get('/subjects', protect, getSubjects);
router.post('/subjects', protect, createSubject);
router.put('/subjects/:id', protect, updateSubject);
router.delete('/subjects/:id', protect, deleteSubject);
router.post('/subjects/toggle-topic', protect, toggleTopicCompletion);

// Exams
router.get('/exams', protect, getExams);
router.post('/exams', protect, createExam);
router.put('/exams/:id', protect, updateExam);
router.delete('/exams/:id', protect, deleteExam);

// Schedule & AI Engine
router.get('/schedule', protect, getOrGenerateSchedule);
router.post('/schedule/seed', protect, seedSampleData);
router.post('/schedule/reschedule', protect, forceReschedule);
router.put('/schedule/block-status', protect, updateBlockStatus);

// Sessions & Gamification
router.post('/sessions', protect, logSession);
router.get('/sessions', protect, getSessionHistory);

// Analytics
router.get('/analytics', protect, getAnalytics);

// Chatbot
router.post('/chatbot/ask', protect, askChatbot);

// Export Data
router.get('/export/csv', protect, exportDataCSV);

// Notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
