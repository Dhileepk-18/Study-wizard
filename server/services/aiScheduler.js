/**
 * Study Wizard - AI Scheduling & Adaptive Engine
 * Formula: Priority Score = 40% Exam Urgency + 30% Subject Difficulty + 20% Remaining Syllabus + 10% Previous Performance
 */

const calculateSubjectPriority = (subject, exams, pastSessions) => {
  const now = new Date();
  
  // 1. Exam Urgency (40%)
  const subjectExams = exams.filter(e => e.subjectId?.toString() === subject._id?.toString() || e.subjectName === subject.name);
  let examUrgencyScore = 20;
  
  if (subjectExams.length > 0) {
    // Find closest upcoming exam
    const sortedExams = subjectExams
      .map(e => new Date(e.examDate))
      .filter(d => d >= now)
      .sort((a, b) => a - b);
      
    if (sortedExams.length > 0) {
      const daysUntilExam = Math.max(0.5, (sortedExams[0] - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExam <= 3) examUrgencyScore = 100;
      else if (daysUntilExam <= 7) examUrgencyScore = 85;
      else if (daysUntilExam <= 14) examUrgencyScore = 65;
      else if (daysUntilExam <= 30) examUrgencyScore = 45;
      else examUrgencyScore = 30;
    }
  }

  // 2. Subject Difficulty (30%)
  let difficultyScore = 50;
  if (subject.difficulty === 'Hard') difficultyScore = 95;
  else if (subject.difficulty === 'Medium') difficultyScore = 65;
  else if (subject.difficulty === 'Easy') difficultyScore = 35;
  
  // Adjust slightly by subject priority setting
  if (subject.priority) {
    difficultyScore = Math.min(100, difficultyScore + (subject.priority - 5) * 3);
  }

  // 3. Remaining Syllabus (20%)
  let totalTopics = 0;
  let completedTopics = 0;
  if (subject.units && subject.units.length > 0) {
    subject.units.forEach(unit => {
      if (unit.topics) {
        totalTopics += unit.topics.length;
        completedTopics += unit.topics.filter(t => t.completed).length;
      }
    });
  }
  const remainingSyllabusRatio = totalTopics > 0 ? (totalTopics - completedTopics) / totalTopics : 0.5;
  const remainingSyllabusScore = remainingSyllabusRatio * 100;

  // 4. Previous Performance / Need (10%)
  // Lower past study time for this subject = higher score (needs attention)
  const subjectSessions = pastSessions.filter(s => s.subjectId?.toString() === subject._id?.toString() || s.subjectName === subject.name);
  const totalStudiedMinutes = subjectSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  let performanceScore = 70;
  if (totalStudiedMinutes < 60) performanceScore = 90;
  else if (totalStudiedMinutes > 300) performanceScore = 40;

  // Weighted Priority Calculation
  const priorityScore = Math.round(
    0.40 * examUrgencyScore +
    0.30 * difficultyScore +
    0.20 * remainingSyllabusScore +
    0.10 * performanceScore
  );

  return {
    priorityScore,
    examUrgencyScore,
    difficultyScore,
    remainingSyllabusScore,
    performanceScore
  };
};

const generateAdaptiveSchedule = (subjects, exams, pastSessions, dailyAvailableHours = 4, preferredTime = 'Evening') => {
  const scheduleByDate = {};
  const totalDailyMinutes = dailyAvailableHours * 60;
  
  // 1. Calculate Priority for each subject
  const subjectPriorities = subjects.map(subject => {
    const pData = calculateSubjectPriority(subject, exams, pastSessions);
    
    // Collect uncompleted topics
    const uncompletedTopics = [];
    if (subject.units) {
      subject.units.forEach(unit => {
        if (unit.topics) {
          unit.topics.forEach(topic => {
            if (!topic.completed) {
              uncompletedTopics.push({
                topicName: topic.name,
                unitTitle: unit.title,
                unitId: unit._id,
                estimatedMinutes: topic.estimatedMinutes || 45,
                topicId: topic._id
              });
            }
          });
        }
      });
    }

    return {
      subject,
      priorityScore: pData.priorityScore,
      uncompletedTopics
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  // Time slots template based on preferred study time
  const getTimeSlots = (preferredTime) => {
    switch (preferredTime) {
      case 'Morning':
        return ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];
      case 'Afternoon':
        return ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
      case 'Night':
        return ['08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'];
      case 'Evening':
      default:
        return ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
    }
  };

  const defaultSlots = getTimeSlots(preferredTime);

  // Generate schedule for today + next 6 days (7 days total)
  const today = new Date();
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayBlocks = [];
    let minutesScheduledToday = 0;
    let slotIndex = 0;

    // First: Check if any topic requires Spaced Repetition Revision on this date
    subjects.forEach(subject => {
      if (subject.units) {
        subject.units.forEach(unit => {
          if (unit.topics) {
            unit.topics.forEach(topic => {
              if (topic.completed && topic.nextRevisionAt) {
                const revDate = new Date(topic.nextRevisionAt).toISOString().split('T')[0];
                if (revDate === dateStr && minutesScheduledToday + 30 <= totalDailyMinutes) {
                  dayBlocks.push({
                    subjectId: subject._id,
                    unitId: unit._id,
                    topicId: topic._id,
                    subjectName: subject.name,
                    subjectColor: subject.color || '#6C63FF',
                    topicName: `[Revision] ${topic.name}`,
                    unitName: unit.title,
                    durationMinutes: 30,
                    scheduledTime: defaultSlots[slotIndex % defaultSlots.length],
                    status: 'pending',
                    isRevision: true,
                    revisionStage: (topic.revisionCount || 0) + 1,
                    priorityScore: 99
                  });
                  minutesScheduledToday += 30;
                  slotIndex++;
                }
              }
            });
          }
        });
      }
    });

    // Fill remaining daily time with highest priority subjects & topics
    for (const item of subjectPriorities) {
      if (minutesScheduledToday >= totalDailyMinutes) break;
      if (item.uncompletedTopics.length === 0) continue;

      // Take a topic for this subject
      const topicIndex = (dayOffset) % Math.max(1, item.uncompletedTopics.length);
      const topic = item.uncompletedTopics[topicIndex] || item.uncompletedTopics[0];

      const duration = Math.min(topic.estimatedMinutes || 45, totalDailyMinutes - minutesScheduledToday);

      dayBlocks.push({
        subjectId: item.subject._id,
        unitId: topic.unitId,
        topicId: topic.topicId,
        subjectName: item.subject.name,
        subjectColor: item.subject.color || '#6C63FF',
        topicName: topic.topicName,
        unitName: topic.unitTitle,
        durationMinutes: duration,
        scheduledTime: defaultSlots[slotIndex % defaultSlots.length],
        status: 'pending',
        isRevision: false,
        priorityScore: item.priorityScore
      });

      minutesScheduledToday += duration;
      slotIndex++;
    }

    scheduleByDate[dateStr] = {
      date: dateStr,
      blocks: dayBlocks,
      totalMinutes: minutesScheduledToday
    };
  }

  return scheduleByDate;
};

module.exports = {
  calculateSubjectPriority,
  generateAdaptiveSchedule
};
