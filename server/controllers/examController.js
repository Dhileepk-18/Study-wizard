const Exam = require('../models/Exam');
const Subject = require('../models/Subject');

// Get all exams
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.user._id }).sort({ examDate: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create exam
const createExam = async (req, res) => {
  try {
    const { subjectId, examName, examDate, examTime, examType, maximumMarks, targetMarks, importanceLevel } = req.body;

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    const subjectName = subject ? subject.name : 'General Subject';

    const exam = new Exam({
      userId: req.user._id,
      subjectId,
      subjectName,
      examName,
      examDate,
      examTime: examTime || '10:00 AM',
      examType: examType || 'CAT',
      maximumMarks: maximumMarks || 100,
      targetMarks: targetMarks || 85,
      importanceLevel: importanceLevel || 'High'
    });

    const savedExam = await exam.save();
    res.status(201).json(savedExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update exam
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExams,
  createExam,
  updateExam,
  deleteExam
};
