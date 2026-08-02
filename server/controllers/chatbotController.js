const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const StudyPlan = require('../models/StudyPlan');
const StudySession = require('../models/StudySession');
const Gamification = require('../models/Gamification');
const StudentProfile = require('../models/StudentProfile');

const askChatbot = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user._id;

    // Fetch all live user data
    const subjects = await Subject.find({ userId });
    const exams = await Exam.find({ userId }).sort({ examDate: 1 });
    const sessions = await StudySession.find({ userId });
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPlan = await StudyPlan.findOne({ userId, date: todayStr });
    const gamification = (await Gamification.findOne({ userId })) || { xp: 0, level: 1, currentStreak: 0, coins: 0 };
    const profile = (await StudentProfile.findOne({ userId })) || { dailyAvailableHours: 4 };

    // Calculate real stats
    const totalMinutesStudied = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalHoursStudied = (totalMinutesStudied / 60).toFixed(1);

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
    const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Find weak and strong subjects
    const subjectStats = subjects.map(sub => {
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
      return { name: sub.name, difficulty: sub.difficulty, total: subTotal, completed: subCompleted, ratio, color: sub.color };
    });

    const weakSubjects = subjectStats
      .filter(s => s.ratio < 0.5 || s.difficulty === 'Hard')
      .sort((a, b) => a.ratio - b.ratio);

    const strongSubjects = subjectStats
      .filter(s => s.ratio >= 0.5)
      .sort((a, b) => b.ratio - a.ratio);

    // Upcoming exams
    const upcomingExams = exams.filter(e => new Date(e.examDate) > new Date());
    const nextExam = upcomingExams.length > 0 ? upcomingExams[0] : null;
    const daysToNextExam = nextExam ? Math.max(0, Math.ceil((new Date(nextExam.examDate) - new Date()) / (1000 * 60 * 60 * 24))) : null;

    // Topics due for revision
    const now = new Date();
    let revisionDueTopics = [];
    subjects.forEach(sub => {
      if (sub.units) {
        sub.units.forEach(u => {
          if (u.topics) {
            u.topics.forEach(t => {
              if (t.completed && t.nextRevisionAt && new Date(t.nextRevisionAt) <= new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)) {
                revisionDueTopics.push({ subject: sub.name, topic: t.name, dueAt: t.nextRevisionAt });
              }
            });
          }
        });
      }
    });

    const q = (question || '').toLowerCase().trim();
    let reply = '';

    // --- INTENT MATCHING ---

    if (q.includes('study today') || q.includes('today schedule') || q.includes('what should i')) {
      if (subjects.length === 0) {
        reply = 'You haven\'t added any subjects yet. Go to the Subjects & Syllabus tab to add your first course, then I can generate study recommendations for you!';
      } else if (todayPlan && todayPlan.blocks && todayPlan.blocks.length > 0) {
        const pendingBlocks = todayPlan.blocks.filter(b => b.status !== 'completed');
        if (pendingBlocks.length > 0) {
          const blockList = pendingBlocks.slice(0, 5).map(b => `  - ${b.subjectName}: "${b.topicName}" (${b.durationMinutes} mins)`).join('\n');
          reply = `Here's your AI-prioritized study plan for today:\n\n${blockList}\n\nYou have ${pendingBlocks.length} session(s) remaining. Start a Pomodoro to begin!`;
        } else {
          reply = `Excellent work! You've completed all ${todayPlan.blocks.length} scheduled sessions for today. Your streak is at ${gamification.currentStreak} days. Take a well-deserved break or review revision cards!`;
        }
      } else {
        const topSubject = weakSubjects.length > 0 ? weakSubjects[0].name : (subjects[0]?.name || 'your courses');
        reply = `No AI schedule has been generated yet. I recommend focusing on "${topSubject}" today for ${profile.dailyAvailableHours || 4} hours. Go to the AI Schedule tab and click "Regenerate AI Plan" to create your timetable!`;
      }

    } else if (q.includes('weakest') || q.includes('weak subject') || q.includes('need help') || q.includes('struggling')) {
      if (subjects.length === 0) {
        reply = 'Add your subjects first so I can analyze which areas need attention!';
      } else if (weakSubjects.length > 0) {
        const weakList = weakSubjects.slice(0, 3).map(s => `  - ${s.name} (${s.difficulty} difficulty, ${Math.round(s.ratio * 100)}% complete)`).join('\n');
        reply = `Based on your syllabus completion and difficulty ratings, these are your weakest areas:\n\n${weakList}\n\nI recommend dedicating extra Pomodoro sessions to these subjects.`;
      } else {
        reply = `Great news! All your subjects are progressing well. Your overall syllabus completion is at ${completionPct}%. Keep maintaining this momentum!`;
      }

    } else if (q.includes('strong') || q.includes('best subject') || q.includes('doing well')) {
      if (strongSubjects.length > 0) {
        const strongList = strongSubjects.slice(0, 3).map(s => `  - ${s.name} (${Math.round(s.ratio * 100)}% complete)`).join('\n');
        reply = `Your strongest areas are:\n\n${strongList}\n\nKeep it up! Consider using spaced revision to maintain retention.`;
      } else {
        reply = 'Keep studying! Once you start completing topics, I\'ll identify your strongest subjects.';
      }

    } else if (q.includes('on track') || q.includes('progress') || q.includes('am i on track') || q.includes('how am i doing')) {
      const streakMsg = gamification.currentStreak > 0 ? `You're on a ${gamification.currentStreak}-day study streak!` : 'You haven\'t started a study streak yet. Complete a Pomodoro session today to begin!';
      reply = `Here's your progress summary:\n\n  - Study Streak: ${gamification.currentStreak} days\n  - Level: ${gamification.level} (${gamification.xp} XP)\n  - Total Hours Studied: ${totalHoursStudied}h\n  - Syllabus Completion: ${completionPct}% (${completedTopics}/${totalTopics} topics)\n  - Subjects: ${subjects.length}\n\n${streakMsg}`;

    } else if (q.includes('hours left') || q.includes('how many hours') || q.includes('remaining today')) {
      if (todayPlan && todayPlan.blocks) {
        const remainingMins = todayPlan.blocks.filter(b => b.status !== 'completed').reduce((acc, b) => acc + b.durationMinutes, 0);
        const completedMins = todayPlan.blocks.filter(b => b.status === 'completed').reduce((acc, b) => acc + b.durationMinutes, 0);
        reply = `Today's study breakdown:\n\n  - Completed: ${(completedMins / 60).toFixed(1)} hours\n  - Remaining: ${(remainingMins / 60).toFixed(1)} hours\n  - Daily Goal: ${profile.dailyAvailableHours || 4} hours`;
      } else {
        reply = `No schedule generated for today yet. Your daily study goal is ${profile.dailyAvailableHours || 4} hours. Generate an AI plan from the Schedule tab!`;
      }

    } else if (q.includes('revise') || q.includes('revision') || q.includes('when should i revise') || q.includes('spaced repetition')) {
      if (revisionDueTopics.length > 0) {
        const revList = revisionDueTopics.slice(0, 5).map(r => `  - ${r.subject}: "${r.topic}"`).join('\n');
        reply = `You have ${revisionDueTopics.length} topic(s) due for spaced revision:\n\n${revList}\n\nStudy Wizard uses intervals of +1, +3, +7, and +15 days for optimal memory retention.`;
      } else {
        reply = 'No topics are currently due for revision. As you complete topics, the spaced repetition engine will automatically schedule reviews at +1, +3, +7, and +15 day intervals.';
      }

    } else if (q.includes('exam') || q.includes('next exam') || q.includes('countdown') || q.includes('upcoming test')) {
      if (nextExam) {
        reply = `Your next exam is:\n\n  - ${nextExam.examName} (${nextExam.subjectName || 'N/A'})\n  - Date: ${new Date(nextExam.examDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n  - Days Left: ${daysToNextExam}\n  - Target: ${nextExam.targetMarks}/${nextExam.maximumMarks} marks\n\n${daysToNextExam <= 5 ? 'This exam is coming up soon! Prioritize intensive revision.' : 'You have time to prepare. Stay consistent with your daily schedule.'}`;
      } else {
        reply = 'No upcoming exams found. Add your exams in the Exams & Countdowns tab so I can factor them into your AI study priority formula!';
      }

    } else if (q.includes('tomorrow') || q.includes('suggest tomorrow') || q.includes('plan for tomorrow')) {
      if (subjects.length === 0) {
        reply = 'Add subjects and exams first, then I can suggest a study plan for tomorrow!';
      } else {
        const topPriority = weakSubjects.length > 0 ? weakSubjects[0].name : subjects[0]?.name;
        const secondPriority = subjects.length > 1 ? (weakSubjects.length > 1 ? weakSubjects[1].name : subjects[1].name) : topPriority;
        const dailyHrs = profile.dailyAvailableHours || 4;
        reply = `Here's my AI recommendation for tomorrow:\n\n  - ${topPriority}: ${(dailyHrs * 0.5).toFixed(1)} hours (highest priority)\n  - ${secondPriority}: ${(dailyHrs * 0.35).toFixed(1)} hours\n  - Spaced Revision: ${(dailyHrs * 0.15).toFixed(1)} hours\n\nClick "Regenerate AI Plan" in the Schedule tab to auto-generate tomorrow's timetable.`;
      }

    } else if (q.includes('tip') || q.includes('advice') || q.includes('motivation') || q.includes('motivate')) {
      const tips = [
        'Break your study into 25-minute Pomodoro blocks. Short bursts with breaks improve focus and retention.',
        'Review your weakest topics first when your energy is highest. Save easier topics for later.',
        'Use active recall instead of passive reading. Quiz yourself on key concepts after each study block.',
        'Stay hydrated and take 5-minute movement breaks between sessions. Your brain needs oxygen!',
        'Track your progress daily. Seeing your streak grow is a powerful motivator to stay consistent.'
      ];
      reply = tips[Math.floor(Math.random() * tips.length)];

    } else if (q.includes('stats') || q.includes('statistics') || q.includes('summary') || q.includes('overview')) {
      reply = `Your Study Wizard Overview:\n\n  - Subjects: ${subjects.length}\n  - Upcoming Exams: ${upcomingExams.length}\n  - Total Study Hours: ${totalHoursStudied}h\n  - Syllabus Progress: ${completionPct}%\n  - Level: ${gamification.level} (${gamification.xp} XP)\n  - Study Streak: ${gamification.currentStreak} days\n  - Coins Earned: ${gamification.coins}`;

    } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      reply = `Hello! I'm your Study Wizard AI Assistant. I have access to your live academic data. Here's what I can help with:\n\n  - "What should I study today?"\n  - "Which subject is my weakest?"\n  - "Am I on track?"\n  - "When is my next exam?"\n  - "When should I revise?"\n  - "Give me a study tip"\n  - "Show my stats"\n\nJust type your question!`;

    } else {
      reply = `I can help you with your studies! Try asking:\n\n  - "What should I study today?"\n  - "Which subject is my weakest?"\n  - "Am I on track?"\n  - "How many hours left today?"\n  - "When is my next exam?"\n  - "When should I revise?"\n  - "Suggest tomorrow's plan"\n  - "Give me a study tip"\n  - "Show my stats"`;
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { askChatbot };
