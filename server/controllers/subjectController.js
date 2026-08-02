const Subject = require('../models/Subject');

// Get all subjects for current user
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create subject (Units start EMPTY unless explicitly provided by user)
const createSubject = async (req, res) => {
  try {
    const { name, code, credits, difficulty, color, priority, professorName, notes, units } = req.body;
    
    const subject = new Subject({
      userId: req.user._id,
      name,
      code: code || name.slice(0, 3).toUpperCase() + '101',
      credits: credits || 4,
      difficulty: difficulty || 'Medium',
      color: color || '#6C63FF',
      priority: priority || 5,
      professorName: professorName || '',
      notes: notes || '',
      units: units || [] // Clean empty units array by default!
    });

    const savedSubject = await subject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Topic completion & trigger Spaced Repetition calculation
const toggleTopicCompletion = async (req, res) => {
  try {
    const { subjectId, unitId, topicId, completed } = req.body;
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    let updatedTopic = null;
    subject.units.forEach(unit => {
      if (unit._id.toString() === unitId) {
        unit.topics.forEach(topic => {
          if (topic._id.toString() === topicId) {
            topic.completed = completed;
            if (completed) {
              topic.lastRevisedAt = new Date();
              topic.revisionCount = (topic.revisionCount || 0) + 1;
              
              const intervals = [1, 3, 7, 15];
              const nextDays = intervals[Math.min(topic.revisionCount - 1, intervals.length - 1)];
              const nextDate = new Date();
              nextDate.setDate(nextDate.getDate() + nextDays);
              topic.nextRevisionAt = nextDate;
            }
            updatedTopic = topic;
          }
        });
      }
    });

    await subject.save();
    res.json({ subject, topic: updatedTopic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleTopicCompletion
};
