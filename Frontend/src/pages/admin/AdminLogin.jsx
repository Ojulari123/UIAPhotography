import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminAuthStore from '../../stores/useAdminAuthStore';
import AdminNotification from '../../components/AdminNotification';

function AdminLogin() {
  const navigate = useNavigate();
  
  // Zustand auth store
  const { login, isAuthenticated, loading, error, clearError } = useAdminAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Show/hide password state
  const [showPassword, setShowPassword] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Show error notification when error changes
  useEffect(() => {
    if (error) {
      showNotificationMessage(error);
      clearError();
    }
  }, [error, clearError]);

  // Show notification helper
  const showNotificationMessage = (message) => {
    setNotification({
      isVisible: true,
      message
    });
  };

  // Close notification helper
  const closeNotification = () => {
    setNotification({
      isVisible: false,
      message: ''
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.password) {
      showNotificationMessage('Please enter both username and password');
      return;
    }

    // Attempt login
    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      showNotificationMessage('Login successful!');
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#171F22] text-white flex flex-col">
      {/* Admin Notification */}
      <AdminNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

      {/* Top Bar */}
      <div className="border-b border-gray-700 px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
        <img 
          src="/src/assets/adminLogo.png" 
          alt="Admin Logo" 
          className="h-8 md:h-10"
        />
        <h1 className="text-xl md:text-2xl font-dm-mono font-medium">
          ADMIN LOGIN
        </h1>
      </div>

      {/* Main Content - Centered Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Title Area */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-dm-sans font-medium mb-2">
              WELCOME BACK
            </h2>
            <p className="text-gray-400 font-dm-sans text-sm">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label 
                htmlFor="username" 
                className="block font-dm-sans text-sm text-gray-400 uppercase tracking-wide mb-2"
              >
                USERNAME
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="w-full bg-transparent border border-gray-500 px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block font-dm-sans text-sm text-gray-400 uppercase tracking-wide mb-2"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full bg-transparent border border-gray-500 px-4 py-3 pr-12 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                  disabled={loading}
                  autoComplete="current-password"
                />
                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    // Eye Off Icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    // Eye Icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#171F22] font-dm-sans font-medium py-3 px-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  LOGGING IN...
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-dm-sans text-xs">
              © {new Date().getFullYear()} UIAPhotography. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;