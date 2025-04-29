import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

const Wishlist = () => {
  // Mock wishlist data - in a real app this would come from state management
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Gold Necklace',
      price: 299.99,
      image: '/src/assets/necklace-image.png'
    },
    {
      id: 3,
      name: 'Diamond Earrings',
      price: 499.99,
      image: '/src/assets/earrings-image.png'
    }
  ]);

  // Remove item from wishlist
  const removeItem = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  // Add to cart (in a real app, this would dispatch an action to add the item to cart)
  const addToCart = (item) => {
    console.log('Added to cart:', item);
    // Here you would typically dispatch an action to add the item to cart
  };

  return (
    <div className="wishlist-page min-h-screen flex flex-col">
      <Navbar />
      <div className="page-container py-10 px-4 max-w-6xl mx-auto flex-grow">
        <h1 className="text-3xl font-semibold mb-6">My Wishlist</h1>
        
        {wishlistItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-4">Product</th>
                  <th className="text-right pb-4">Price</th>
                  <th className="text-right pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-4">
                      <div className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded mr-4"
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => addToCart(item)}
                          className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition"
                          title="Add to Cart"
                        >
                          <FiShoppingCart size={18} />
                        </button>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Remove"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FiTrash2 className="mx-auto text-gray-400 mb-4" size={50} />
            <h2 className="text-2xl font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any jewelry to your wishlist yet.</p>
            <a href="/shop" className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition inline-block">
              Continue Shopping
            </a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;