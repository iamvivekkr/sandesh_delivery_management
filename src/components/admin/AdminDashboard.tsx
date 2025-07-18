import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Store, 
  MapPin, 
  Users, 
  ClipboardList, 
  LogOut,
  Plus,
  Settings
} from 'lucide-react';
import RestaurantManagement from './RestaurantManagement';
import AddressManagement from './AddressManagement';
import DeliveryBoyManagement from './DeliveryBoyManagement';
import SubmissionDashboard from './SubmissionDashboard';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('submissions');

  const tabs = [
    { id: 'submissions', label: 'Delivery Submissions', icon: ClipboardList },
    { id: 'restaurants', label: 'Restaurants', icon: Store },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'delivery-boys', label: 'Delivery Boys', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'restaurants':
        return <RestaurantManagement />;
      case 'addresses':
        return <AddressManagement />;
      case 'delivery-boys':
        return <DeliveryBoyManagement />;
      default:
        return <SubmissionDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-8">
          <nav className="w-64 bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;