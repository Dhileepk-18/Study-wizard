const StudyPlan = require('../models/StudyPlan');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const StudySession = require('../models/StudySession');
const StudentProfile = require('../models/StudentProfile');
const { generateAdaptiveSchedule } = require('../services/aiScheduler');

// Generate or fetch AI schedule for current user
const getOrGenerateSchedule = async (req, res) => {
  try {
    const userId = req.user._id;

    let subjects = await Subject.find({ userId });
    let exams = await Exam.find({ userId });
    let sessions = await StudySession.find({ userId });
    let profile = await StudentProfile.findOne({ userId });

    const availableHours = profile ? profile.dailyAvailableHours : 4;
    const preferredTime = profile ? profile.preferredStudyTime : 'Evening';

    // If user has no subjects yet, return empty list (clean fresh state!)
    if (subjects.length === 0) {
      return res.json([]);
    }

    // Generate calculated schedule dictionary for next 7 days
    const generatedDict = generateAdaptiveSchedule(subjects, exams, sessions, availableHours, preferredTime);

    // Save or update in StudyPlan collection
    const resultPlans = [];
    for (const dateStr of Object.keys(generatedDict)) {
      const planData = generatedDict[dateStr];
      let existingPlan = await StudyPlan.findOne({ userId, date: dateStr });
      
      if (!existingPlan) {
        existingPlan = await StudyPlan.create({
          userId,
          date: dateStr,
          blocks: planData.blocks,
          totalMinutes: planData.totalMinutes
        });
      } else {
        const completedBlocks = existingPlan.blocks.filter(b => b.status === 'completed');
        const newPendingBlocks = planData.blocks.filter(b => !completedBlocks.some(cb => cb.topicName === b.topicName));
        
        existingPlan.blocks = [...completedBlocks, ...newPendingBlocks];
        existingPlan.totalMinutes = existingPlan.blocks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
        await existingPlan.save();
      }
      resultPlans.push(existingPlan);
    }

    res.json(resultPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed sample data explicitly if requested by user
const seedSampleData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has subjects
    const existing = await Subject.find({ userId });
    if (existing.length > 0) {
      return res.json({ message: 'User already has data' });
    }

    const defaultSubjects = [
      {
        userId,
        name: 'Data Structures & Algorithms',
        code: 'CS301',
        credits: 4,
        difficulty: 'Hard',
        color: '#6C63FF',
        priority: 9,
        units: [
          {
            title: 'Unit 1: Trees & Graphs',
            unitNumber: 1,
            topics: [
              { name: 'Binary Search Trees', estimatedMinutes: 45, difficulty: 'Hard', completed: false },
              { name: 'Graph Traversal (BFS & DFS)', estimatedMinutes: 50, difficulty: 'Medium', completed: false }
            ]
          }
        ]
      },
      {
        userId,
        name: 'Database Systems',
        code: 'CS304',
        credits: 3,
        difficulty: 'Medium',
        color: '#4F8EF7',
        priority: 7,
        units: [
          {
            title: 'Unit 1: Relational Model',
            unitNumber: 1,
            topics: [
              { name: 'SQL Joins & Normalization', estimatedMinutes: 40, difficulty: 'Medium', completed: false }
            ]
          }
        ]
      }
    ];

    const savedSubjects = await Subject.insertMany(defaultSubjects);

    await Exam.create({
      userId,
      subjectId: savedSubjects[0]._id,
      subjectName: savedSubjects[0].name,
      examName: 'Mid-Sem CAT Exam',
      examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      examTime: '10:00 AM',
      examType: 'CAT',
      maximumMarks: 100,
      targetMarks: 85,
      importanceLevel: 'High'
    });

    res.json({ message: 'Sample data seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Force Adaptive Reschedule
const forceReschedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const subjects = await Subject.find({ userId });
    const exams = await Exam.find({ userId });
    const sessions = await StudySession.find({ userId });
    const profile = await StudentProfile.findOne({ userId });

    if (subjects.length === 0) {
      return res.json([]);
    }

    const availableHours = profile ? profile.dailyAvailableHours : 4;
    const preferredTime = profile ? profile.preferredStudyTime : 'Evening';

    const generatedDict = generateAdaptiveSchedule(subjects, exams, sessions, availableHours, preferredTime);
    const todayStr = new Date().toISOString().split('T')[0];

    for (const dateStr of Object.keys(generatedDict)) {
      if (dateStr >= todayStr) {
        let plan = await StudyPlan.findOne({ userId, date: dateStr });
        const freshBlocks = generatedDict[dateStr].blocks;

        if (plan) {
          const completed = plan.blocks.filter(b => b.status === 'completed');
          plan.blocks = [...completed, ...freshBlocks];
          plan.totalMinutes = plan.blocks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
          await plan.save();
        } else {
          await StudyPlan.create({
            userId,
            date: dateStr,
            blocks: freshBlocks,
            totalMinutes: generatedDict[dateStr].totalMinutes
          });
        }
      }
    }

    const updatedPlans = await StudyPlan.find({ userId }).sort({ date: 1 });
    res.json(updatedPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update study block status
const updateBlockStatus = async (req, res) => {
  try {
    const { planId, blockId, status } = req.body;
    const plan = await StudyPlan.findOne({ _id: planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const block = plan.blocks.id(blockId);
    if (!block) return res.status(404).json({ message: 'Block not found' });

    block.status = status;
    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrGenerateSchedule,
  seedSampleData,
  forceReschedule,
  updateBlockStatus
};
