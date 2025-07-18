const express = require('express');
const Restaurant = require('../models/Restaurant');
const Address = require('../models/Address');
const DeliveryBoy = require('../models/DeliveryBoy');
const Delivery = require('../models/Delivery');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Restaurant Routes
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/restaurants', async (req, res) => {
  try {
    const { name, status } = req.body;
    const restaurant = new Restaurant({ name, status });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/restaurants/:id', async (req, res) => {
  try {
    const { name, status } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Address Routes
router.get('/addresses', async (req, res) => {
  try {
    const addresses = await Address.find().sort({ createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/addresses', async (req, res) => {
  try {
    const { address_name, delivery_charge } = req.body;
    const address = new Address({ address_name, delivery_charge });
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/addresses/:id', async (req, res) => {
  try {
    const { address_name, delivery_charge } = req.body;
    const address = await Address.findByIdAndUpdate(
      req.params.id,
      { address_name, delivery_charge },
      { new: true }
    );
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delivery Boy Routes
router.get('/delivery-boys', async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find().select('-password').sort({ createdAt: -1 });
    res.json(deliveryBoys);
  } catch (error) {
    console.error('Get delivery boys error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/delivery-boys', async (req, res) => {
  try {
    const { name, username, password, status } = req.body;
    
    // Check if username already exists
    const existingDeliveryBoy = await DeliveryBoy.findOne({ username });
    if (existingDeliveryBoy) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const deliveryBoy = new DeliveryBoy({ name, username, password, status });
    await deliveryBoy.save();
    
    // Return without password
    const { password: _, ...deliveryBoyData } = deliveryBoy.toObject();
    res.status(201).json(deliveryBoyData);
  } catch (error) {
    console.error('Create delivery boy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/delivery-boys/:id', async (req, res) => {
  try {
    const { name, username, password, status } = req.body;
    
    const updateData = { name, username, status };
    if (password) {
      updateData.password = password;
    }
    
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    res.json(deliveryBoy);
  } catch (error) {
    console.error('Update delivery boy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delivery-boys/:id', async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndDelete(req.params.id);
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    res.json({ message: 'Delivery boy deleted successfully' });
  } catch (error) {
    console.error('Delete delivery boy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delivery Submissions Routes
router.get('/deliveries', async (req, res) => {
  try {
    const { startDate, endDate, deliveryBoy, restaurant } = req.query;
    
    let filter = {};
    
    if (startDate || endDate) {
      filter.date_time = {};
      if (startDate) filter.date_time.$gte = new Date(startDate);
      if (endDate) filter.date_time.$lte = new Date(endDate);
    }
    
    if (deliveryBoy) filter.delivery_boy_id = deliveryBoy;
    if (restaurant) filter.restaurant_id = restaurant;
    
    const deliveries = await Delivery.find(filter)
      .populate('delivery_boy_id', 'name username')
      .populate('restaurant_id', 'name')
      .populate('address_id', 'address_name')
      .sort({ date_time: -1 });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;