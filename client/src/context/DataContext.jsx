import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [schedulePlans, setSchedulePlans] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [gamification, setGamification] = useState({
    xp: 0,
    level: 1,
    coins: 0,
    currentStreak: 0,
    longestStreak: 0,
    badges: []
  });
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    if (token) {
      refreshAll();
    } else {
      setSubjects([]);
      setExams([]);
      setSchedulePlans([]);
      setAnalytics(null);
      setNotifications([]);
      setGamification({
        xp: 0,
        level: 1,
        coins: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: []
      });
      setLoading(false);
    }
  }, [token]);

  const refreshAll = async () => {
    if (!localStorage.getItem('study_wizard_token') && !token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [subjRes, examRes, schedRes, analyticsRes, notifRes] = await Promise.all([
        API.get('/subjects'),
        API.get('/exams'),
        API.get('/schedule'),
        API.get('/analytics'),
        API.get('/notifications')
      ]);

      setSubjects(subjRes.data || []);
      setExams(examRes.data || []);
      setSchedulePlans(schedRes.data || []);
      setAnalytics(analyticsRes.data || null);
      setNotifications(notifRes.data || []);

      if (analyticsRes.data && analyticsRes.data.gamification) {
        setGamification(analyticsRes.data.gamification);
      }
    } catch (err) {
      console.error('Error loading DataContext:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAdaptiveReschedule = async () => {
    try {
      setRescheduling(true);
      const res = await API.post('/schedule/reschedule');
      setSchedulePlans(res.data || []);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      await refreshAll();
    } catch (err) {
      console.error('Reschedule error:', err);
    } finally {
      setRescheduling(false);
    }
  };

  const updateBlockStatus = async (planId, blockId, status, subjectId, unitId, topicId) => {
    try {
      if (planId && blockId) {
        await API.put('/schedule/block-status', { planId, blockId, status });
      }
      if (subjectId) {
        await API.post('/subjects/toggle-topic', { subjectId, unitId, topicId, completed: status === 'completed' });
      }
      if (status === 'completed') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      }
      await refreshAll();
    } catch (err) {
      console.error('Update block status error:', err);
    }
  };

  const toggleTopicCompletion = async (subjectId, unitId, topicId, completed) => {
    try {
      if (subjectId) {
        await API.post('/subjects/toggle-topic', { subjectId, unitId, topicId, completed });
      }
      if (completed) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      }
      await refreshAll();
    } catch (err) {
      console.error('Toggle topic error:', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Notification error:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      subjects,
      exams,
      schedulePlans,
      analytics,
      notifications,
      gamification,
      loading,
      rescheduling,
      refreshAll,
      triggerAdaptiveReschedule,
      updateBlockStatus,
      toggleTopicCompletion,
      markNotificationRead
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

