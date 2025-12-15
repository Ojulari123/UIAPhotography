import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAdminOrderStore from '../../stores/useAdminOrderStore';
import useAdminProductStore from '../../stores/useAdminProductStore';

function AdminDashboard() {
  const location = useLocation();
  
  // Zustand stores
  const { orders, fetchAllOrders, loading: ordersLoading } = useAdminOrderStore();
  const { products, fetchProducts, loading: productsLoading } = useAdminProductStore();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0
  });

  // Helper function to get order title display
  const getOrderTitle = (order) => {
    // Check if items exist and is a non-empty array
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return 'No items';
    }
    
    const firstItem = order.items[0];
    // Get the name - could be 'name' or 'title' depending on backend response
    const itemName = firstItem.name || firstItem.title || 'Unnamed product';
    
    // Calculate total quantity across all items
    const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // If only 1 total item (quantity), just show the name
    if (totalQuantity === 1) {
      return itemName;
    }
    
    // If multiple items of same product OR multiple different products
    const itemCount = order.items.length;
    if (itemCount === 1 && totalQuantity > 1) {
      // Same product, multiple quantity (e.g., "2x Whispering Hillside")
      return `${itemName} (x${totalQuantity})`;
    } else {
      // Multiple different products
      return `${itemName} +${itemCount - 1} more`;
    }
  };

  // Helper function to get order format display
  const getOrderFormat = (order) => {
    // Check if items exist and is a non-empty array
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return 'N/A';
    }
    
    // Check if order has mixed types - handle both string and object product_type
    const hasDigital = order.items.some(item => {
      const type = typeof item.product_type === 'object' 
        ? item.product_type?.value 
        : item.product_type;
      return type?.toLowerCase() === 'digital';
    });
    
    const hasPhysical = order.items.some(item => {
      const type = typeof item.product_type === 'object' 
        ? item.product_type?.value 
        : item.product_type;
      return type?.toLowerCase() === 'physical';
    });
    
    if (hasDigital && hasPhysical) {
      return 'Mixed';
    } else if (hasDigital) {
      return 'Digital';
    } else if (hasPhysical) {
      return 'Physical';
    }
    
    return 'N/A';
  };

  // Refresh function to re-fetch all data
  const handleRefresh = () => {
    console.log('🔄 Refreshing dashboard data...');
    fetchAllOrders();
    fetchProducts();
  };

  // Fetch data on mount
  useEffect(() => {
    console.log('📊 Fetching dashboard data...');
    fetchAllOrders();
    fetchProducts();
  }, [fetchAllOrders, fetchProducts]);

  // Log fetched data for debugging
  useEffect(() => {
    console.log('📦 Orders received:', orders);
    console.log('📦 Products received:', products);
    
    // Debug: Log each order's items structure
    if (orders.length > 0) {
      console.log('🔍 Order items structure check:');
      orders.forEach((order, index) => {
        console.log(`Order ${order.id}:`, {
          customer: order.customer_name,
          hasItems: !!order.items,
          itemsIsArray: Array.isArray(order.items),
          itemCount: order.items?.length || 0,
          items: order.items
        });
      });
    }
  }, [orders, products]);

  // Calculate stats from real data - only count orders with items
  useEffect(() => {
    console.log('🔢 Calculating stats...');
    
    // Filter to only valid orders (those with items)
    const validOrders = orders.filter(order => 
      order.items && Array.isArray(order.items) && order.items.length > 0
    );
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = parseFloat(order.order_total) || 0;
      return sum + amount;
    }, 0);
    
    const pendingOrders = orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return status === 'pending' || status === 'processing' || status === 'unpaid';
    }).length;

    const calculatedStats = {
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      pendingOrders,
      totalProducts: products.length
    };

    console.log('📊 Calculated Stats:', calculatedStats);
    console.log(`📊 Valid orders (with items): ${validOrders.length} / ${totalOrders}`);
    setStats(calculatedStats);
  }, [orders, products]);

  const isActive = (path) => location.pathname === path;

  // Get last 8 recent orders (show all orders, even those without items)
  const recentOrders = [...orders].reverse().slice(0, 8);

  console.log('📋 Recent orders to display:', recentOrders);

  const isLoading = ordersLoading || productsLoading;

  
  return (
    <div className="min-h-screen bg-[#171F22] text-white overflow-x-hidden">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
        <img 
          src="/src/assets/adminLogo.png" 
          alt="Admin Logo" 
          className="h-8 md:h-10"
        />
        
        {/* Desktop: ADMIN PAGE text */}
        <h1 className="hidden md:block text-xl md:text-2xl font-dm-mono font-medium">
          ADMIN PAGE
        </h1>

        {/* Mobile: Hamburger Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 w-6"
        >
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 h-full w-64 bg-[#171F22] border-l border-gray-700 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-6">
              <Link 
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block font-dm-mono text-lg ${
                  isActive('/admin/dashboard') ? 'font-medium' : 'font-normal'
                } hover:text-gray-300 transition-colors`}
              >
                DASHBOARD
              </Link>
              <Link 
                to="/admin/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block font-dm-mono text-lg ${
                  isActive('/admin/orders') ? 'font-medium' : 'font-normal'
                } hover:text-gray-300 transition-colors`}
              >
                ORDERS
              </Link>
              <Link 
                to="/admin/store"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block font-dm-mono text-lg ${
                  isActive('/admin/store') ? 'font-medium' : 'font-normal'
                } hover:text-gray-300 transition-colors`}
              >
                STORE
              </Link>
              <Link 
                to="/admin/portfolio"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block font-dm-mono text-lg ${
                  isActive('/admin/portfolio') ? 'font-medium' : 'font-normal'
                } hover:text-gray-300 transition-colors`}
              >
                PORTFOLIO
              </Link>
              <Link 
                to="/admin/pic-of-week"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block font-dm-mono text-lg ${
                  isActive('/admin/pic-of-week') ? 'font-medium' : 'font-normal'
                } hover:text-gray-300 transition-colors`}
              >
                P&POTW
              </Link>
            </nav>
          </div>
        </div>
      )}

      <div className="flex pt-16 md:pt-20">
        {/* Fixed Desktop Sidebar */}
        <aside className="hidden md:block fixed left-0 top-16 md:top-20 w-52 border-r border-gray-700 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#171F22] p-6 overflow-y-auto">
          <nav className="space-y-6">
            <Link 
              to="/admin/dashboard"
              className={`block font-dm-mono text-lg ${
                isActive('/admin/dashboard') ? 'font-medium' : 'font-normal'
              } hover:text-gray-300 transition-colors`}
            >
              DASHBOARD
            </Link>
            <Link 
              to="/admin/orders"
              className={`block font-dm-mono text-lg ${
                isActive('/admin/orders') ? 'font-medium' : 'font-normal'
              } hover:text-gray-300 transition-colors`}
            >
              ORDERS
            </Link>
            <Link 
              to="/admin/store"
              className={`block font-dm-mono text-lg ${
                isActive('/admin/store') ? 'font-medium' : 'font-normal'
              } hover:text-gray-300 transition-colors`}
            >
              STORE
            </Link>
            <Link 
              to="/admin/portfolio"
              className={`block font-dm-mono text-lg ${
                isActive('/admin/portfolio') ? 'font-medium' : 'font-normal'
              } hover:text-gray-300 transition-colors`}
            >
              PORTFOLIO
            </Link>
            <Link 
              to="/admin/pic-of-week"
              className={`block font-dm-mono text-lg ${
                isActive('/admin/pic-of-week') ? 'font-medium' : 'font-normal'
              } hover:text-gray-300 transition-colors`}
            >
              P&POTW
            </Link>
          </nav>
        </aside>

        {/* Main Content - with left margin on desktop to account for fixed sidebar */}
        <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-12 bg-[#171F22] min-h-screen overflow-x-hidden">
          {/* Welcome Message with Refresh Button */}
          <div className="flex items-center justify-between mb-6 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-kyiv-serif font-medium">
              WELCOME BACK FOMS
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 font-dm-sans text-sm md:text-base text-white hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              <span className="hidden sm:inline">REFRESH</span>
            </button>
          </div>

          {/* Loading State - Skeleton Loaders */}
          {isLoading ? (
            <>
              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-2 gap-4 mb-8 md:gap-6 md:mb-16">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-12 md:h-16 bg-gray-700 rounded w-24 md:w-32 mb-2"></div>
                    <div className="h-3 md:h-4 bg-gray-700 rounded w-20 md:w-24"></div>
                  </div>
                ))}
              </div>

              {/* Orders Section Skeleton */}
              <div>
                <div className="h-6 md:h-8 bg-gray-700 rounded w-24 md:w-32 mb-4 md:mb-6 animate-pulse"></div>

                {/* Table Skeleton */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-4 md:px-2 whitespace-nowrap">
                          CLIENTS
                        </th>
                        <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-4 md:px-2 whitespace-nowrap">
                          TITLE
                        </th>
                        <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-4 md:px-2 whitespace-nowrap">
                          AMOUNT
                        </th>
                        <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-4 md:px-2 whitespace-nowrap">
                          FORMAT
                        </th>
                        <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-4 md:px-2 whitespace-nowrap">
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(8)].map((_, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 md:py-4 px-4 md:px-2">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-20 md:w-24 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 px-4 md:px-2">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-24 md:w-32 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 px-4 md:px-2">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-12 md:w-16 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 px-4 md:px-2">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-16 md:w-20 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 px-4 md:px-2">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-16 md:w-20 animate-pulse"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Stats Grid - 2 per row on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 md:grid-cols-4 md:gap-6 md:mb-16">
                {/* Total Orders */}
                <div>
                  <p className="text-5xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.totalOrders}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    TOTAL ORDERS
                  </p>
                </div>

                {/* Total Revenue */}
                <div>
                  <p className="text-5xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    £{stats.totalRevenue}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    TOTAL REVENUE
                  </p>
                </div>

                {/* Pending Orders */}
                <div>
                  <p className="text-5xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    PENDING ORDERS
                  </p>
                </div>

                {/* Products */}
                <div>
                  <p className="text-5xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.totalProducts}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    PRODUCTS
                  </p>
                </div>
              </div>

              {/* Orders Section */}
              <div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-dm-sans font-medium mb-4 md:mb-6">
                  ORDERS
                </h3>

                {recentOrders.length === 0 ? (
                  <p className="text-gray-400 font-dm-sans text-sm md:text-base">No orders yet.</p>
                ) : (
                  /* Table container - only this scrolls horizontally */
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="min-w-[800px] px-4 md:px-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 pr-6 whitespace-nowrap">
                              CLIENTS
                            </th>
                            <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-6 whitespace-nowrap">
                              TITLE
                            </th>
                            <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-6 whitespace-nowrap">
                              AMOUNT
                            </th>
                            <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 px-6 whitespace-nowrap">
                              FORMAT
                            </th>
                            <th className="text-left font-dm-sans text-xs md:text-sm font-medium py-3 md:py-4 pl-6 whitespace-nowrap">
                              STATUS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-700">
                              <td className="font-dm-sans text-xs md:text-sm py-3 md:py-4 pr-6 whitespace-nowrap">
                                {order.customer_name || 'N/A'}
                              </td>
                              <td className="font-dm-sans text-xs md:text-sm py-3 md:py-4 px-6 whitespace-nowrap">
                                {getOrderTitle(order)}
                              </td>
                              <td className="font-dm-sans text-xs md:text-sm py-3 md:py-4 px-6 whitespace-nowrap">
                                £{parseFloat(order.order_total || 0).toFixed(2)}
                              </td>
                              <td className="font-dm-sans text-xs md:text-sm py-3 md:py-4 px-6 whitespace-nowrap capitalize">
                                {getOrderFormat(order)}
                              </td>
                              <td className="font-dm-sans text-xs md:text-sm py-3 md:py-4 pl-6 whitespace-nowrap capitalize">
                                {order.status || 'Pending'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;