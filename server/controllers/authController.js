const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Gamification = require('../models/Gamification');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'studywizardsecretkey123', {
    expiresIn: '30d'
  });
};

// Register User (Starts with 100% clean empty state: 0 XP, 0 Streak, 0 Subjects, 0 Notifications)
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password
    });

    // Create fresh empty profile
    await StudentProfile.create({
      userId: user._id,
      college: '',
      department: '',
      semester: '',
      year: '',
      learningStyle: 'Visual',
      dailyAvailableHours: 4,
      preferredStudyTime: 'Evening'
    });

    // Create fresh clean gamification record (0 XP, 0 Coins, 0 Streak, 0 Badges)
    await Gamification.create({
      userId: user._id,
      xp: 0,
      level: 1,
      coins: 0,
      currentStreak: 0,
      longestStreak: 0,
      badges: []
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get & Update Profile
const getProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id,
        college: '',
        department: '',
        semester: '',
        year: '',
        learningStyle: 'Visual',
        dailyAvailableHours: 4,
        preferredStudyTime: 'Evening'
      });
    }
    res.json({ user: req.user, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
