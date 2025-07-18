import React, { useState } from 'react';
import { Address } from '../../types';
import { apiService } from '../../services/api';
import { Plus, Edit2, Trash2, MapPin, Search, IndianRupee } from 'lucide-react';

const AddressManagement: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address_name: '',
    delivery_charge: ''
  });

  React.useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAddresses();
      setAddresses(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAddresses = addresses.filter(address =>
    address.address_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const addressData = {
        address_name: formData.address_name,
        delivery_charge: parseFloat(formData.delivery_charge)
      };
      
      if (editingAddress) {
        await apiService.updateAddress(editingAddress._id, addressData);
      } else {
        await apiService.createAddress(addressData);
      }
      
      await loadAddresses();
      resetForm();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ address_name: '', delivery_charge: '' });
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({ 
      address_name: address.address_name, 
      delivery_charge: address.delivery_charge.toString() 
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setLoading(true);
        await apiService.deleteAddress(id);
        await loadAddresses();
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Address Management</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="p-6 bg-gray-50 border-b">
          <form onSubmit={handleSubmit} className="max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Name
                </label>
                <input
                  type="text"
                  value={formData.address_name}
                  onChange={(e) => setFormData({ ...formData, address_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Sector 10, MG Road"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.delivery_charge}
                  onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter delivery charge"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {editingAddress ? 'Update' : 'Add'} Address
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-900">Address Name</th>
                <th className="text-left p-3 font-medium text-gray-900">Delivery Charge</th>
                <th className="text-left p-3 font-medium text-gray-900">Created</th>
                <th className="text-left p-3 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAddresses.map((address) => (
                <tr key={address._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{address.address_name}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">{address.delivery_charge.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {address.createdAt ? new Date(address.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAddresses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No addresses found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManagement;