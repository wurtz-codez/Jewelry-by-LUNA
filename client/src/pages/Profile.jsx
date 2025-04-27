import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiEdit, FiUser, FiShoppingBag, FiHeart, FiLogOut } from 'react-icons/fi';

const Profile = () => {
  // Mock user data - in a real app this would come from state/context
  const [user, setUser] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '(123) 456-7890',
    address: '123 Main St, New York, NY 10001'
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('profile');

  // Mock order data
  const orders = [
    { id: '1234', date: '2025-04-20', status: 'Delivered', total: 449.98 },
    { id: '5678', date: '2025-04-15', status: 'Shipped', total: 199.99 }
  ];

  return (
    <div className="profile-page min-h-screen flex flex-col">
      <Navbar />
      <div className="page-container py-10 px-4 max-w-6xl mx-auto flex-grow">
        <h1 className="text-3xl font-semibold mb-6">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-3">
                  <FiUser className="text-gray-600" size={32} />
                </div>
                <h2 className="text-xl font-medium">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
              
              <nav className="profile-nav">
                <button 
                  className={`w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 transition ${activeTab === 'profile' ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FiUser /> Profile
                </button>
                <button 
                  className={`w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <FiShoppingBag /> Orders
                </button>
                <button 
                  className={`w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 transition ${activeTab === 'wishlist' ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  <FiHeart /> Wishlist
                </button>
                <button 
                  className="w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 text-red-500 hover:bg-red-50 transition"
                >
                  <FiLogOut /> Logout
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'profile' && (
                <div className="profile-info">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    <button className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <FiEdit size={16} /> Edit
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Full Name</h3>
                      <p className="font-medium">{user.name}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Email Address</h3>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Phone Number</h3>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Default Address</h3>
                      <p className="font-medium">{user.address}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Security</h2>
                    </div>
                    <button className="text-gray-700 hover:text-black underline font-medium">
                      Change Password
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'orders' && (
                <div className="orders-info">
                  <h2 className="text-xl font-semibold mb-4">Order History</h2>
                  
                  {orders.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Order ID</th>
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Status</th>
                          <th className="text-right pb-2">Total</th>
                          <th className="text-right pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b">
                            <td className="py-4">#{order.id}</td>
                            <td className="py-4">{order.date}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'Delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">${order.total.toFixed(2)}</td>
                            <td className="py-4 text-right">
                              <button className="text-blue-500 hover:underline">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You haven't placed any orders yet.</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'wishlist' && (
                <div className="wishlist-info">
                  <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
                  <p className="text-gray-500 mb-4">
                    <a href="/wishlist" className="text-blue-500 hover:underline">
                      Go to My Wishlist
                    </a> to view all your saved items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;