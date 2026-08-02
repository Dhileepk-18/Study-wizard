const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const StudySession = require('../models/StudySession');

const formatDateSafe = (dateVal) => {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

const exportDataCSV = async (req, res) => {
  try {
    const userId = req.user._id;

    const subjects = await Subject.find({ userId });
    const exams = await Exam.find({ userId });
    const sessions = await StudySession.find({ userId });

    let csvContent = `Type,Name,Detail,Value,Date\n`;

    subjects.forEach(s => {
      csvContent += `Subject,"${(s.name || '').replace(/"/g, '""')}",Code: ${s.code || 'N/A'},Difficulty: ${s.difficulty || 'Medium'},${formatDateSafe(s.createdAt)}\n`;
    });

    exams.forEach(e => {
      csvContent += `Exam,"${(e.examName || '').replace(/"/g, '""')}",Subject: ${e.subjectName || 'General'},Target: ${e.targetMarks || 0}/${e.maximumMarks || 100},${formatDateSafe(e.examDate)}\n`;
    });

    sessions.forEach(s => {
      csvContent += `Session,"${(s.subjectName || '').replace(/"/g, '""')}",Topic: ${(s.topicName || '').replace(/"/g, '""')},Duration: ${s.durationMinutes || 0}m (Focus: ${s.focusScore || 0}%),${formatDateSafe(s.completedAt)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=study_wizard_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { exportDataCSV };

