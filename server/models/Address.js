const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address_name: {
    type: String,
    required: true,
    trim: true
  },
  delivery_charge: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);