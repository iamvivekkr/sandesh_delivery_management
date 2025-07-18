import React, { useState, useMemo } from 'react';
import { Delivery, Restaurant, Address, DeliveryBoy } from '../../types';
import { apiService } from '../../services/api';
import { ClipboardList, Filter, IndianRupee, Calendar, User, Store } from 'lucide-react';

const SubmissionDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    deliveryBoy: '',
    restaurant: ''
  });

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    loadDeliveries();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, restaurantsData, addressesData, deliveryBoysData] = await Promise.all([
        apiService.getDeliveries(),
        apiService.getRestaurants(),
        apiService.getAddresses(),
        apiService.getDeliveryBoys()
      ]);
      
      setDeliveries(deliveriesData);
      setRestaurants(restaurantsData);
      setAddresses(addressesData);
      setDeliveryBoys(deliveryBoysData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      const data = await apiService.getDeliveries(filters);
      setDeliveries(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.date_time);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && deliveryDate < startDate) return false;
      if (endDate && deliveryDate > endDate) return false;
      if (filters.deliveryBoy && delivery.delivery_boy_id !== filters.deliveryBoy) return false;
      if (filters.restaurant && delivery.restaurant_id !== filters.restaurant) return false;

      return true;
    });
  }, [deliveries, filters]);

  const totalRevenue = filteredDeliveries.reduce((sum, delivery) => sum + delivery.total, 0);
  const totalDeliveryCharges = filteredDeliveries.reduce((sum, delivery) => sum + delivery.delivery_charge, 0);
  const totalFoodCost = filteredDeliveries.reduce((sum, delivery) => sum + delivery.food_cost, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Delivery Submissions Dashboard</h2>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-900">{filteredDeliveries.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Delivery Charges</h3>
            <p className="text-2xl font-bold text-purple-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {totalDeliveryCharges.toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-600">Food Cost</h3>
            <p className="text-2xl font-bold text-orange-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {totalFoodCost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Boy</label>
            <select
              value={filters.deliveryBoy}
              onChange={(e) => setFilters({ ...filters, deliveryBoy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Delivery Boys</option>
              {deliveryBoys.map(boy => (
                <option key={boy._id} value={boy._id}>{boy.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
            <select
              value={filters.restaurant}
              onChange={(e) => setFilters({ ...filters, restaurant: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Restaurants</option>
              {restaurants.map(restaurant => (
                <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="p-6">
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-900">Delivery Boy</th>
                <th className="text-left p-3 font-medium text-gray-900">Restaurant</th>
                <th className="text-left p-3 font-medium text-gray-900">Address</th>
                <th className="text-left p-3 font-medium text-gray-900">Delivery Charge</th>
                <th className="text-left p-3 font-medium text-gray-900">Food Cost</th>
                <th className="text-left p-3 font-medium text-gray-900">Total</th>
                <th className="text-left p-3 font-medium text-gray-900">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {typeof delivery.delivery_boy_id === 'object' ? delivery.delivery_boy_id.name : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {typeof delivery.restaurant_id === 'object' ? delivery.restaurant_id.name : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-900">
                    {typeof delivery.address_id === 'object' ? delivery.address_id.address_name : 'Unknown'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{delivery.delivery_charge.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{delivery.food_cost.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">{delivery.total.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">
                        {new Date(delivery.date_time).toLocaleString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDeliveries.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No delivery submissions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDashboard;