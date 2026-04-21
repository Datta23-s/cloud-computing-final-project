const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@attendpay.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const user = await User.findOne({ email });

    // Success if DB match OR exact match with .env (Failsafe)
    if ((user && (await user.matchPassword(password))) || 
        (email === adminEmail && password === adminPassword)) {
      
      // Update last login timestamp
      activeUser.lastLogin = new Date();
      await activeUser.save();

      // Log success to Atlas
      await LoginLog.create({
        email,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return res.json({
        _id: activeUser._id,
        email: activeUser.email,
        lastLogin: activeUser.lastLogin,
        token: jwt.sign({ id: activeUser._id }, process.env.JWT_SECRET, {
          expiresIn: '30d',
        }),
      });
    } else {
      // Log failure to Atlas
      await LoginLog.create({
        email,
        status: 'FAILURE',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
