// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- CORRECTION: Import the auth middleware ---
const auth = require('../middleware/auth');
// --- END OF CORRECTION ---
require('dotenv').config(); // Consider moving this if needed globally, but okay here too.

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user instance
    user = new User({ username, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create JWT payload
    const payload = { user: { id: user.id } };
    
    // Sign the JWT token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err); // Log the specific JWT error
        return res.status(500).send('Server error during token generation'); // Send specific error
      }
      // Send token back to client
      res.json({ token });
    });
  } catch (err) {
    console.error('Registration Error:', err.message); // More descriptive logging
    // Check for Mongoose validation errors or other specific DB issues if needed
    res.status(500).send('Server error during registration');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    let user = await User.findOne({ username });

    // If user doesn't exist, send invalid credentials message
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, send invalid credentials message
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = { user: { id: user.id } };
    
    // Sign the JWT token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err); // Log the specific JWT error
        return res.status(500).send('Server error during token generation'); // Send specific error
      }
      // Send token back to client
      res.json({ token, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } }); // Optionally send user details
    });
  } catch (err) {
    console.error('Login Error:', err.message); // More descriptive logging
    res.status(500).send('Server error during login');
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (typically handled client-side for JWT, but endpoint can acknowledge)
// @access  Private (requires valid token)
router.post('/logout', auth, async (req, res) => { // <-- 'auth' middleware is now correctly imported and used
  try {
    // For JWT, logout is primarily handled client-side by removing the token.
    // Server-side, you might invalidate the token if you have a blacklist system.
    // For now, acknowledge the request successfully.
    // You could potentially clear any server-side session data here if used.
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout Error:', err.message); // More descriptive logging
    res.status(500).send('Server error during logout');
  }
});

module.exports = router;