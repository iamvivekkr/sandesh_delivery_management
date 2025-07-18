const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const DeliveryBoy = require('../models/DeliveryBoy');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(admin._id, admin.role);

    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delivery Boy Login
router.post('/delivery-boy/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find delivery boy by username
    const deliveryBoy = await DeliveryBoy.findOne({ username, status: 'active' });
    if (!deliveryBoy) {
      return res.status(401).json({ message: 'Invalid credentials or account inactive' });
    }

    // Check password
    const isMatch = await deliveryBoy.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(deliveryBoy._id, deliveryBoy.role);

    res.json({
      token,
      user: {
        id: deliveryBoy._id,
        username: deliveryBoy.username,
        name: deliveryBoy.name,
        role: deliveryBoy.role
      }
    });
  } catch (error) {
    console.error('Delivery boy login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;