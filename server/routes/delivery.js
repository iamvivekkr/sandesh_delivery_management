const express = require('express');
const Restaurant = require('../models/Restaurant');
const Address = require('../models/Address');
const Delivery = require('../models/Delivery');
const { deliveryBoyAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require delivery boy authentication
router.use(deliveryBoyAuth);

// Get active restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: 'active' }).sort({ name: 1 });
    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all addresses
router.get('/addresses', async (req, res) => {
  try {
    const addresses = await Address.find().sort({ address_name: 1 });
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get address by ID (for delivery charge)
router.get('/addresses/:id', async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(address);
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit delivery
router.post('/submit', async (req, res) => {
  try {
    const { restaurant_id, address_id, food_cost } = req.body;
    
    // Get address to fetch delivery charge
    const address = await Address.findById(address_id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Verify restaurant exists and is active
    const restaurant = await Restaurant.findOne({ _id: restaurant_id, status: 'active' });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or inactive' });
    }
    
    const delivery_charge = address.delivery_charge;
    const total = parseFloat(food_cost) + delivery_charge;
    
    const delivery = new Delivery({
      delivery_boy_id: req.user._id,
      restaurant_id,
      address_id,
      delivery_charge,
      food_cost: parseFloat(food_cost),
      total,
      date_time: new Date()
    });
    
    await delivery.save();
    
    // Populate the response
    await delivery.populate([
      { path: 'restaurant_id', select: 'name' },
      { path: 'address_id', select: 'address_name' }
    ]);
    
    res.status(201).json(delivery);
  } catch (error) {
    console.error('Submit delivery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get delivery boy's submissions
router.get('/my-deliveries', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ delivery_boy_id: req.user._id })
      .populate('restaurant_id', 'name')
      .populate('address_id', 'address_name')
      .sort({ date_time: -1 });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Get my deliveries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get delivery boy stats
router.get('/stats', async (req, res) => {
  try {
    const totalDeliveries = await Delivery.countDocuments({ delivery_boy_id: req.user._id });
    
    const totalEarnings = await Delivery.aggregate([
      { $match: { delivery_boy_id: req.user._id } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDeliveries = await Delivery.countDocuments({
      delivery_boy_id: req.user._id,
      date_time: { $gte: today }
    });
    
    res.json({
      totalDeliveries,
      totalEarnings: totalEarnings[0]?.total || 0,
      todayDeliveries
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;