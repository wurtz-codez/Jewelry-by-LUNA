import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banDetails, setBanDetails] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setShowToast(true);
        setTimeout(() => {
          // Redirect to admin dashboard if user is admin
          if (result.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate(from);
          }
        }, 1000);
      } else if (result.error === 'Account is banned') {
        setBanDetails(authError?.details);
        setShowBanModal(true);
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Sign in
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              to="/register"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>

      {showToast && (
        <Toast
          message="Login successful"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Account Banned
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Your account has been banned from accessing the platform.
              </p>
              {banDetails?.reason && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Reason:</p>
                  <p className="text-gray-600">{banDetails.reason}</p>
                </div>
              )}
              {banDetails?.expiry && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Ban Expires:</p>
                  <p className="text-gray-600">
                    {new Date(banDetails.expiry).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                onClick={() => setShowBanModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;