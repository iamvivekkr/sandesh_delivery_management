import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Restaurant, Address, Delivery } from '../../types';
import { apiService } from '../../services/api';
import { 
  Truck, 
  LogOut, 
  Store, 
  MapPin, 
  IndianRupee, 
  Calculator,
  Send,
  CheckCircle
} from 'lucide-react';

const DeliveryBoyDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState({ totalDeliveries: 0, totalEarnings: 0, todayDeliveries: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    restaurant_id: '',
    address_id: '',
    food_cost: ''
  });
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const finalTotal = selectedAddress ? parseFloat(formData.food_cost || '0') + selectedAddress.delivery_charge : 0;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.address_id) {
      loadAddressDetails(formData.address_id);
    } else {
      setSelectedAddress(null);
    }
  }, [formData.address_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [restaurantsData, addressesData, deliveriesData, statsData] = await Promise.all([
        apiService.getActiveRestaurants(),
        apiService.getAllAddresses(),
        apiService.getMyDeliveries(),
        apiService.getMyStats()
      ]);
      
      setRestaurants(restaurantsData);
      setAddresses(addressesData);
      setDeliveries(deliveriesData);
      setStats(statsData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAddressDetails = async (addressId: string) => {
    try {
      const address = await apiService.getAddressById(addressId);
      setSelectedAddress(address);
    } catch (error: any) {
      console.error('Failed to load address details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await apiService.submitDelivery({
        restaurant_id: formData.restaurant_id,
        address_id: formData.address_id,
        food_cost: parseFloat(formData.food_cost)
      });
      
      // Reload data
      await loadData();
      
      // Reset form
      setFormData({ restaurant_id: '', address_id: '', food_cost: '' });
      setSelectedAddress(null);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Delivery Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Form */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Submit New Delivery</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Store className="inline w-4 h-4 mr-2" />
                    Select Restaurant
                  </label>
                  <select
                    value={formData.restaurant_id}
                    onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a restaurant...</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Select Delivery Address
                  </label>
                  <select
                    value={formData.address_id}
                    onChange={(e) => setFormData({ ...formData, address_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose an address...</option>
                    {addresses.map(address => (
                      <option key={address._id} value={address._id}>
                        {address.address_name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAddress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Delivery Charge</h3>
                    <div className="flex items-center space-x-2 text-blue-800">
                      <IndianRupee className="w-5 h-5" />
                      <span className="text-lg font-semibold">{selectedAddress.delivery_charge.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IndianRupee className="inline w-4 h-4 mr-2" />
                    Food Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.food_cost}
                    onChange={(e) => setFormData({ ...formData, food_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter food cost"
                    required
                  />
                </div>

                {selectedAddress && formData.food_cost && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-900 mb-2">
                      <Calculator className="inline w-4 h-4 mr-2" />
                      Final Total
                    </h3>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex justify-between">
                        <span>Food Cost:</span>
                        <span>₹{parseFloat(formData.food_cost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charge:</span>
                        <span>₹{selectedAddress.delivery_charge.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-green-300 pt-2 flex justify-between font-semibold text-green-900">
                        <span>Total:</span>
                        <span>₹{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  disabled={loading}
                >
                  <Send className="w-5 h-5" />
                  <span>Submit Delivery</span>
                </button>
              </form>
            </div>
          </div>

          {/* Stats & Recent Submissions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deliveries:</span>
                  <span className="font-semibold">{stats.totalDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earned:</span>
                  <span className="font-semibold">
                    ₹{stats.totalEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today's Deliveries:</span>
                  <span className="font-semibold">
                    {stats.todayDeliveries}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h3>
              <div className="space-y-3">
                {deliveries.slice(-3).reverse().map((delivery) => {
                  const restaurant = typeof delivery.restaurant_id === 'object' ? delivery.restaurant_id : null;
                  const address = typeof delivery.address_id === 'object' ? delivery.address_id : null;
                  
                  return (
                    <div key={delivery._id} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{restaurant?.name}</p>
                          <p className="text-sm text-gray-600">{address?.address_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{delivery.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(delivery.date_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {deliveries.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No deliveries yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Delivery submitted successfully!</span>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyDashboard;