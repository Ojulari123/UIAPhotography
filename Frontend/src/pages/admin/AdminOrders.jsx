import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Select from 'react-select';
import useAdminOrderStore from '../../stores/useAdminOrderStore';
import { shippingService } from '../../api/shippingService';
import { orderService } from '../../api/orderService';
import apiClient from '../../api/axiosConfig';
import AdminNotification from '../../components/AdminNotification';
import adminLogo from '../../assets/adminLogo.png';


function AdminOrders() {
  const location = useLocation();
  
  // Zustand store - includes updateOrderStatus to sync status across all pages
  const { orders, fetchAllOrders, loading, deleteOrder, updateOrderStatus } = useAdminOrderStore();

  // Refreshing state
  const [refreshing, setRefreshing] = useState(false);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Pagination state
  const [displayCount, setDisplayCount] = useState(15);

  // Add Order Modal state
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Order Details Modal state
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderShipping, setOrderShipping] = useState(null);
  const [orderShippingInfo, setOrderShippingInfo] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Update Shipping Modal state
  const [showUpdateShippingModal, setShowUpdateShippingModal] = useState(false);
  const [updatingShipping, setUpdatingShipping] = useState(false);
  const [shippingFormData, setShippingFormData] = useState({
    carrierType: '',
    carrier: '',
    tracking_number: '',
    tracking_url: '',
    orderStatus: ''
  });

  // Delete Order state
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    customerEmail: '',
    productName: '',
    productId: '',
    productPrice: '',
    quantity: '',
    productType: null,
    countryCode: '',
    city: '',
    state: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: '',
  });

  // Stats state
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  // Carrier options for dropdown
  const carrierOptions = [
    { value: 'evri', label: 'EVRI' },
    { value: 'royal_mail', label: 'ROYAL MAIL' },
    { value: 'other', label: 'Other' }
  ];

  // Order status options for dropdown (only Shipped and Delivered for updates)
  const orderStatusOptions = [
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }
  ];

  // Product type options for react-select
  const productTypeOptions = [
    { value: 'digital', label: 'Digital' },
    { value: 'physical', label: 'Physical' }
  ];

  // Custom styles for react-select to match dark theme
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: 'white',
      borderRadius: '0.25rem',
      minHeight: '44px',
      boxShadow: state.isFocused ? '0 0 0 1px white' : 'none',
      '&:hover': {
        borderColor: 'white'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#171F22',
      border: '1px solid white',
      borderRadius: '0.25rem',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#374151' : state.isFocused ? '#1f2937' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#374151'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280',
    }),
    input: (base) => ({
      ...base,
      color: 'white',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'white',
      '&:hover': {
        color: 'white'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
  };

  // Show notification helper
  const showNotification = (message) => {
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

  // Handle refresh orders
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllOrders();
      showNotification('Orders refreshed successfully!');
    } catch (err) {
      showNotification('Failed to refresh orders');
    } finally {
      setRefreshing(false);
    }
  };

  // Copy tracker URL to clipboard
  const handleCopyTrackerUrl = (url) => {
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        showNotification('Tracker URL copied to clipboard!');
      }).catch(() => {
        showNotification('Failed to copy URL');
      });
    }
  };

  // Helper function to get order title display
  const getOrderTitle = (order) => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return 'No items';
    }
    
    const firstItem = order.items[0];
    const itemName = firstItem.name || firstItem.title || 'Unnamed product';
    const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    if (totalQuantity === 1) {
      return itemName;
    }
    
    const itemCount = order.items.length;
    if (itemCount === 1 && totalQuantity > 1) {
      return `${itemName} (x${totalQuantity})`;
    } else {
      return `${itemName} +${itemCount - 1} more`;
    }
  };

  // Helper function to get order format display
  const getOrderFormat = (order) => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return 'N/A';
    }
    
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

  // Helper function to check if order is digital-only
  const isDigitalOnlyOrder = (order) => {
    if (!order?.items || !Array.isArray(order.items) || order.items.length === 0) {
      return false;
    }
    
    return order.items.every(item => {
      const type = typeof item.product_type === 'object' 
        ? item.product_type?.value 
        : item.product_type;
      return type?.toLowerCase() === 'digital';
    });
  };

  // Handle clicking on an order row to view details
  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
    setLoadingOrderDetails(true);
    setOrderShipping(null);
    setOrderShippingInfo(null);

    try {
      // Only fetch shipping data for physical/mixed orders (not digital-only)
      if (!isDigitalOnlyOrder(order)) {
        // Fetch shipping address data
        try {
          const shippingResponse = await shippingService.getShippingByOrderId(order.id);
          if (shippingResponse.data && shippingResponse.data.length > 0) {
            setOrderShipping(shippingResponse.data[0]);
          }
        } catch (err) {
          console.log('No shipping address found for order:', order.id);
        }

        // Fetch shipping tracking info
        try {
          const shippingInfoResponse = await shippingService.getShippingInfoByOrderId(order.id);
          if (shippingInfoResponse.data) {
            setOrderShippingInfo(shippingInfoResponse.data);
          }
        } catch (err) {
          console.log('No shipping info found for order:', order.id);
        }
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // Close order details modal
  const closeOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setSelectedOrder(null);
    setOrderShipping(null);
    setOrderShippingInfo(null);
  };

  // Open update shipping modal
  const openUpdateShippingModal = () => {
    // Determine carrier type from existing carrier
    let carrierType = '';
    const existingCarrier = orderShippingInfo?.carrier?.toLowerCase() || '';
    if (existingCarrier === 'evri') {
      carrierType = 'evri';
    } else if (existingCarrier === 'royal mail' || existingCarrier === 'royal_mail') {
      carrierType = 'royal_mail';
    } else if (existingCarrier) {
      carrierType = 'other';
    }

    setShippingFormData({
      carrierType: carrierType,
      carrier: carrierType === 'other' ? (orderShippingInfo?.carrier || '') : '',
      tracking_number: orderShippingInfo?.tracking_number || '',
      tracking_url: orderShippingInfo?.tracking_url || '',
      orderStatus: selectedOrder?.status || 'pending'
    });
    setShowUpdateShippingModal(true);
  };

  // Handle carrier type dropdown change
  const handleCarrierTypeChange = (selectedOption) => {
    setShippingFormData(prev => ({
      ...prev,
      carrierType: selectedOption?.value || '',
      carrier: selectedOption?.value === 'other' ? prev.carrier : ''
    }));
  };

  // Handle order status dropdown change
  const handleOrderStatusChange = (selectedOption) => {
    setShippingFormData(prev => ({
      ...prev,
      orderStatus: selectedOption?.value || ''
    }));
  };

  // Handle shipping form input changes
  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    setShippingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit shipping update
  const handleUpdateShipping = async (e) => {
    e.preventDefault();
    setUpdatingShipping(true);

    try {
      // Determine the final carrier value
      let finalCarrier = '';
      if (shippingFormData.carrierType === 'evri') {
        finalCarrier = 'EVRI';
      } else if (shippingFormData.carrierType === 'royal_mail') {
        finalCarrier = 'ROYAL MAIL';
      } else if (shippingFormData.carrierType === 'other') {
        finalCarrier = shippingFormData.carrier;
      }

      if (!finalCarrier || !shippingFormData.tracking_number) {
        throw new Error('Carrier and tracking number are required');
      }

      const shippingData = {
        carrier: finalCarrier,
        tracking_number: shippingFormData.tracking_number,
        tracking_url: shippingFormData.tracking_url,
        order_status: shippingFormData.orderStatus || 'shipped'
      };

      await shippingService.addShippingInfo(selectedOrder.id, shippingData);
      
      // Update order status if changed
      if (shippingFormData.orderStatus) {
        // Update the selected order's status locally (for order details page)
        setSelectedOrder(prev => ({
          ...prev,
          status: shippingFormData.orderStatus
        }));
        
        // Update the order status in Zustand store (syncs to orders table and dashboard)
        updateOrderStatus(selectedOrder.id, shippingFormData.orderStatus);
        
        // Send order update email when status changes to shipped
        // This calls POST /send-order-update/{order_id} which sends email
        if (shippingFormData.orderStatus === 'shipped') {
          try {
            await orderService.updateOrderStatus(selectedOrder.id);
            console.log('Order shipped email sent successfully');
          } catch (err) {
            console.log('Could not send order update email:', err);
          }
        }
      }
      
      showNotification('Shipping info updated successfully!');
      
      // Refresh shipping info
      try {
        const shippingInfoResponse = await shippingService.getShippingInfoByOrderId(selectedOrder.id);
        if (shippingInfoResponse.data) {
          setOrderShippingInfo(shippingInfoResponse.data);
        }
      } catch (err) {
        console.log('Could not refresh shipping info');
      }

      setShowUpdateShippingModal(false);
    } catch (err) {
      console.error('Error updating shipping:', err);
      // Handle error message - ensure it's a string, not an object
      let errorMessage = 'Failed to update shipping info';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Validation errors array - extract messages
          errorMessage = err.response.data.detail
            .map(error => error.msg || String(error))
            .join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (typeof err.response.data.detail === 'object') {
          // Handle object detail
          errorMessage = err.response.data.detail.msg || JSON.stringify(err.response.data.detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      showNotification(errorMessage);
    } finally {
      setUpdatingShipping(false);
    }
  };

  // Handle delete order from details modal
  const handleDeleteOrderFromDetails = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = async () => {
    setDeletingOrder(true);
    try {
      await deleteOrder(selectedOrder.id);
      showNotification(`Order #${selectedOrder.id} deleted successfully!`);
      
      // Close modals and refresh
      setShowDeleteConfirm(false);
      closeOrderDetailsModal();
      fetchAllOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      
      // Handle different error types
      let errorMessage = 'Failed to delete order';
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot delete order - server error. The order may have related checkout records that prevent deletion.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage);
      setShowDeleteConfirm(false);
    } finally {
      setDeletingOrder(false);
    }
  };

  // Get product type display for order details
  const getProductTypeDisplay = (item) => {
    const type = typeof item.product_type === 'object' 
      ? item.product_type?.value 
      : item.product_type;
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle product type selection
  const handleProductTypeChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      productType: selectedOption
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      clientName: '',
      customerEmail: '',
      productName: '',
      productId: '',
      productPrice: '',
      quantity: '',
      productType: null,
      countryCode: '',
      city: '',
      state: '',
      postalCode: '',
      addressLine1: '',
      addressLine2: '',
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!formData.clientName || !formData.customerEmail || !formData.productName || 
          !formData.productId || !formData.productPrice || !formData.quantity || !formData.productType) {
        throw new Error('Please fill in all required fields');
      }

      // Additional validation for physical products
      if (formData.productType?.value === 'physical') {
        if (!formData.countryCode || !formData.city || !formData.state || 
            !formData.postalCode || !formData.addressLine1) {
          throw new Error('Please fill in all shipping details for physical products');
        }
      }

      // Prepare order data matching CreateOrder schema
      const orderData = {
        customer_name: formData.clientName,
        customer_email: formData.customerEmail,
        items: [{
          product_id: parseInt(formData.productId),
          name: formData.productName,
          price: parseFloat(formData.productPrice),
          quantity: parseInt(formData.quantity),
          product_type: formData.productType.value
        }]
      };

      // Build request body - Backend requires order_data wrapper
      const requestBody = {
        order_data: orderData
      };

      // Add shipping if physical product
      if (formData.productType?.value === 'physical') {
        requestBody.shipping = {
          country_code: formData.countryCode.toUpperCase(),
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2 || '',
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode
        };
      }

      console.log('📦 Sending order payload:', requestBody);

      // Make API call
      const response = await apiClient.post('/order?shipping_type=standard', requestBody);
      console.log('✅ Order created:', response.data);
      
      // Show success notification
      showNotification('Order created successfully!');
      
      // Refresh orders list
      fetchAllOrders();
      
      // Reset form and close modal after short delay
      setTimeout(() => {
        resetForm();
        setShowAddOrderModal(false);
      }, 1500);

    } catch (err) {
      console.error('❌ Error creating order:', err);
      
      let errorMessage = 'Failed to create order. Please try again.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail
            .map(error => `${error.loc?.join(' → ') || ''}: ${error.msg}`)
            .join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error notification
      showNotification(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    console.log('📊 Fetching orders data...');
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Log fetched data for debugging
  useEffect(() => {
    console.log('📦 Orders received:', orders);
    
    if (orders.length > 0) {
      console.log('🔍 Order items structure check:');
      orders.forEach((order) => {
        console.log(`Order ${order.id}:`, {
          customer: order.customer_name,
          hasItems: !!order.items,
          itemsIsArray: Array.isArray(order.items),
          itemCount: order.items?.length || 0,
          items: order.items
        });
      });
    }
  }, [orders]);

  // Calculate stats from real data
  // Completed orders only count "delivered" status (not "shipped")
  useEffect(() => {
    console.log('🔢 Calculating stats...');
    
    const totalOrders = orders.length;
    
    // Pending includes shipped since order isn't fully complete yet
    const pendingOrders = orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return status === 'pending' || status === 'processing' || status === 'unpaid' || status === 'ordered' || status === 'shipped';
    }).length;

    // Only count "delivered" as completed (not "shipped")
    const completedOrders = orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return status === 'completed' || status === 'delivered';
    }).length;

    const calculatedStats = {
      totalOrders,
      pendingOrders,
      completedOrders
    };

    console.log('📊 Calculated Stats:', calculatedStats);
    setStats(calculatedStats);
  }, [orders]);

  const isActive = (path) => location.pathname === path;

  // Get orders to display (reversed to show newest first)
  const ordersToDisplay = [...orders].reverse().slice(0, displayCount);
  const hasMoreOrders = orders.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 15);
  };

  // Check if product type is physical
  const isPhysicalProduct = formData.productType?.value === 'physical';

  return (
    <div className="min-h-screen bg-[#171F22] text-white overflow-x-hidden">
      {/* Admin Notification */}
      <AdminNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
        <img 
          src={adminLogo} 
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

      {/* Add Order Modal - Full page overlay */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-[#171F22] z-50 overflow-y-auto">
          {/* Fixed Top Bar */}
          <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
            <img 
              src={adminLogo} 
              alt="Admin Logo" 
              className="h-8 md:h-10"
            />
            <h1 className="hidden md:block text-xl md:text-2xl font-dm-mono font-medium">
              ADMIN PAGE
            </h1>
          </div>

          <div className="flex pt-16 md:pt-20">
            {/* Fixed Desktop Sidebar */}
            <aside className="hidden md:block fixed left-0 top-16 md:top-20 w-52 border-r border-gray-700 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#171F22] p-6 overflow-y-auto">
              <nav className="space-y-6">
                <Link to="/admin/dashboard" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  DASHBOARD
                </Link>
                <Link to="/admin/orders" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
                  ORDERS
                </Link>
                <Link to="/admin/store" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  STORE
                </Link>
                <Link to="/admin/portfolio" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  PORTFOLIO
                </Link>
                <Link to="/admin/pic-of-week" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  P&POTW
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-12 bg-[#171F22] min-h-screen">
              {/* Back Button */}
              <button
                onClick={() => {
                  resetForm();
                  setShowAddOrderModal(false);
                }}
                className="flex items-center gap-2 text-white font-dm-sans text-sm mb-4 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                BACK
              </button>

              <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
                ADD ORDER
              </h2>

              {/* Form - Wide layout matching design */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl">
              {/* Client Name */}
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="ENTER CLIENT NAME"
                className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                disabled={submitting}
              />

              {/* Customer Email */}
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="ENTER CUSTOMER EMAIL"
                className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                disabled={submitting}
              />

              {/* Product Name */}
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="ENTER PRODUCT NAME"
                className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                disabled={submitting}
              />

              {/* Product ID */}
              <input
                type="number"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                placeholder="ENTER PRODUCT ID"
                min="1"
                className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                disabled={submitting}
              />

              {/* Product Price */}
              <input
                type="number"
                name="productPrice"
                value={formData.productPrice}
                onChange={handleInputChange}
                placeholder="ENTER PRODUCT PRICE"
                step="0.01"
                min="0"
                className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                disabled={submitting}
              />

              {/* Quantity */}
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="ENTER QUANTITY"
                min="1"
                className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                disabled={submitting}
              />

              {/* Product Type/Format - React Select */}
              <Select
                value={formData.productType}
                onChange={handleProductTypeChange}
                options={productTypeOptions}
                styles={selectStyles}
                placeholder="SELECT PRODUCT TYPE/FORMAT"
                isDisabled={submitting}
                classNamePrefix="select"
              />

              {/* Physical Product Fields - Only show if physical is selected */}
              {isPhysicalProduct && (
                <>
                  {/* Country Code, City, State, Postal Code Row */}
                  <div className="grid grid-cols-4 gap-3">
                    <input
                      type="text"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      placeholder="COUNTRY CODE"
                      className="w-full bg-transparent border border-white px-3 py-3 font-dm-sans text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                      disabled={submitting}
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="CITY"
                      className="w-full bg-transparent border border-white px-3 py-3 font-dm-sans text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                      disabled={submitting}
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="STATE"
                      className="w-full bg-transparent border border-white px-3 py-3 font-dm-sans text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                      disabled={submitting}
                    />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="POSTAL CODE"
                      className="w-full bg-transparent border border-white rounded px-3 py-3 font-dm-sans text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                      disabled={submitting}
                    />
                  </div>

                  {/* Address Line 1 */}
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="ADDRESS LINE 1"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />

                  {/* Address Line 2 */}
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="ADDRESS LINE 2"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'ADDING...' : 'ADD ORDER'}
                </button>
              </div>
              </form>
            </main>
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

        {/* Main Content */}
        <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-12 bg-[#171F22] min-h-screen overflow-x-hidden">
          {/* Page Title with Refresh and Add Order Buttons */}
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-dm-sans font-medium">
              ORDERS
            </h2>
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="flex items-center gap-2 bg-transparent border border-white text-white font-dm-sans text-sm px-4 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'REFRESHING...' : 'REFRESH'}
              </button>
              
              {/* Add Order Button */}
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="flex items-center gap-2 bg-transparent border border-white text-white font-dm-sans text-sm px-4 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD ORDER
              </button>
            </div>
          </div>

          {/* Loading State - Skeleton Loaders */}
          {loading ? (
            <>
              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-16">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-12 md:h-16 bg-gray-700 rounded w-16 md:w-32 mb-2"></div>
                    <div className="h-3 md:h-4 bg-gray-700 rounded w-16 md:w-24"></div>
                  </div>
                ))}
              </div>

              {/* Table Skeleton */}
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
                      {[...Array(15)].map((_, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 md:py-4 pr-6">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-20 md:w-24 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 px-6">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-24 md:w-32 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 px-6">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-12 md:w-16 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 px-6">
                            <div className="h-3 md:h-4 bg-gray-700 rounded w-16 md:w-20 animate-pulse"></div>
                          </td>
                          <td className="py-3 md:py-4 pl-6">
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
              {/* Stats Grid - 3 stats */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-16">
                {/* Total Orders */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.totalOrders}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    TOTAL ORDERS
                  </p>
                </div>

                {/* Pending Orders */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    PENDING ORDERS
                  </p>
                </div>

                {/* Completed Orders */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.completedOrders}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    COMPLETED ORDERS
                  </p>
                </div>
              </div>

              {/* Orders Table */}
              {ordersToDisplay.length === 0 ? (
                <p className="text-gray-400 font-dm-sans text-sm md:text-base">No orders yet.</p>
              ) : (
                <>
                  {/* Table container - only this scrolls horizontally */}
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
                          {ordersToDisplay.map((order) => (
                            <tr 
                              key={order.id} 
                              className="border-b border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
                              onClick={() => handleOrderClick(order)}
                            >
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

                  {/* Load More Button */}
                  {hasMoreOrders && (
                    <div className="flex justify-center mt-6 mb-6">
                      <button
                        onClick={handleLoadMore}
                        className="font-dm-sans text-sm md:text-base text-white hover:text-gray-300 transition-colors uppercase tracking-wider"
                      >
                        LOAD MORE
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Order Details Page (replaces main content) */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#171F22]">
          {/* Top Bar - Same as main page */}
          <div className="fixed top-0 left-0 right-0 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-gray-700 bg-[#171F22] z-20">
            <Link to="/" className="text-lg md:text-xl font-dm-mono font-medium">
              UIAPHOTOGRAPHY
            </Link>
            <span className="font-dm-mono text-sm md:text-base">ADMIN PAGE</span>
          </div>

          <div className="flex pt-16 md:pt-20 h-screen">
            {/* Fixed Desktop Sidebar */}
            <aside className="hidden md:block fixed left-0 top-16 md:top-20 w-52 border-r border-gray-700 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#171F22] p-6 overflow-y-auto">
              <nav className="space-y-6">
                <Link 
                  to="/admin/dashboard"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  DASHBOARD
                </Link>
                <Link 
                  to="/admin/orders"
                  className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors"
                >
                  ORDERS
                </Link>
                <Link 
                  to="/admin/store"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  STORE
                </Link>
                <Link 
                  to="/admin/portfolio"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  PORTFOLIO
                </Link>
                <Link 
                  to="/admin/pic-of-week"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  P&POTW
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-8 bg-[#171F22] overflow-y-auto">
              {/* Back Button */}
              <button
                onClick={closeOrderDetailsModal}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors font-dm-sans text-sm mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                BACK
              </button>

              <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
                ORDER DETAILS
              </h2>

              {loadingOrderDetails ? (
                <div className="animate-pulse space-y-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-700 rounded w-48"></div>
                    <div className="h-4 bg-gray-700 rounded w-40"></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Client Details Section */}
                  <div className="mb-8">
                    <h3 className="font-dm-sans text-base md:text-lg font-medium mb-4 pb-2 border-b border-gray-600">
                      CLIENT DETAILS
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                          FULL NAME
                        </p>
                        <p className="font-dm-sans text-sm">
                          {selectedOrder.customer_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                          EMAIL
                        </p>
                        <p className="font-dm-sans text-sm">
                          {selectedOrder.customer_email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                          PHONE NUMBER
                        </p>
                        <p className="font-dm-sans text-sm">
                          {selectedOrder.phone_number || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Details Section */}
                  <div className="mb-8">
                    <h3 className="font-dm-sans text-base md:text-lg font-medium mb-4 pb-2 border-b border-gray-600">
                      PRODUCT DETAILS
                    </h3>
                    
                    {/* Product Table Header */}
                    <div className="grid grid-cols-4 gap-4 mb-2">
                      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">TITLE</p>
                      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">AMOUNT</p>
                      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">FORMAT</p>
                      <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide">STATUS</p>
                    </div>

                    {/* Product Items */}
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 py-2">
                          <p className="font-dm-sans text-sm">
                            {item.name || 'Unnamed'}{item.quantity > 1 ? ` (x${item.quantity})` : ''}
                          </p>
                          <p className="font-dm-sans text-sm">
                            £{parseFloat(item.price || 0).toFixed(0)}
                          </p>
                          <p className="font-dm-sans text-sm capitalize">
                            {getProductTypeDisplay(item)}
                          </p>
                          <p className="font-dm-sans text-sm capitalize">
                            {selectedOrder.status || 'Pending'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="font-dm-sans text-sm text-gray-400">No items in this order</p>
                    )}
                  </div>

                  {/* Shipping Details Section - Only show for Physical/Mixed orders (not digital-only) */}
                  {!isDigitalOnlyOrder(selectedOrder) && (
                    <div className="mb-8">
                      <h3 className="font-dm-sans text-base md:text-lg font-medium mb-4 pb-2 border-b border-gray-600">
                        SHIPPING DETAILS
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            COUNTRY CODE
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShipping?.country_code || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            POSTAL CODE
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShipping?.postal_code || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            CITY
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShipping?.city || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            STATE
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShipping?.state || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            ADDRESS LINE 1
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShipping?.address_line1 || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            ADDRESS LINE 2
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShipping?.address_line2 || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            TRACKER URL
                          </p>
                          <div className="flex items-center gap-2">
                            {orderShippingInfo?.tracking_url ? (
                              <>
                                <p className="font-dm-sans text-sm max-w-[200px] truncate">
                                  {orderShippingInfo.tracking_url}
                                </p>
                                <button
                                  onClick={() => handleCopyTrackerUrl(orderShippingInfo.tracking_url)}
                                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                                  title="Copy URL"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <p className="font-dm-sans text-sm">N/A</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            TRACKING NUMBER
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShippingInfo?.tracking_number || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-dm-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                            CARRIER
                          </p>
                          <p className="font-dm-sans text-sm">
                            {orderShippingInfo?.carrier || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={handleDeleteOrderFromDetails}
                      className="bg-red-600 border border-red-600 text-white font-dm-sans text-sm px-6 py-2 hover:bg-red-700 hover:border-red-700 transition-colors"
                    >
                      DELETE ORDER
                    </button>
                    {/* Only show UPDATE SHIPPING button for Physical/Mixed orders */}
                    {!isDigitalOnlyOrder(selectedOrder) && (
                      <button
                        onClick={openUpdateShippingModal}
                        className="bg-transparent border border-white text-white font-dm-sans text-sm px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
                      >
                        UPDATE SHIPPING
                      </button>
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Update Shipping Page (replaces main content) */}
      {showUpdateShippingModal && (
        <div className="fixed inset-0 z-[60] bg-[#171F22]">
          {/* Top Bar - Same as main page */}
          <div className="fixed top-0 left-0 right-0 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-gray-700 bg-[#171F22] z-20">
            <Link to="/" className="text-lg md:text-xl font-dm-mono font-medium">
              UIAPHOTOGRAPHY
            </Link>
            <span className="font-dm-mono text-sm md:text-base">ADMIN PAGE</span>
          </div>

          <div className="flex pt-16 md:pt-20 h-screen">
            {/* Fixed Desktop Sidebar */}
            <aside className="hidden md:block fixed left-0 top-16 md:top-20 w-52 border-r border-gray-700 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#171F22] p-6 overflow-y-auto">
              <nav className="space-y-6">
                <Link 
                  to="/admin/dashboard"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  DASHBOARD
                </Link>
                <Link 
                  to="/admin/orders"
                  className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors"
                >
                  ORDERS
                </Link>
                <Link 
                  to="/admin/store"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  STORE
                </Link>
                <Link 
                  to="/admin/portfolio"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  PORTFOLIO
                </Link>
                <Link 
                  to="/admin/pic-of-week"
                  className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors"
                >
                  P&POTW
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-8 bg-[#171F22] overflow-y-auto">
              {/* Back Button */}
              <button
                onClick={() => setShowUpdateShippingModal(false)}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors font-dm-sans text-sm mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                BACK
              </button>

              <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
                SHIPPING DETAILS
              </h2>

              <form onSubmit={handleUpdateShipping} className="max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Carrier Dropdown */}
                  <div>
                    <label className="block font-dm-sans text-sm text-white uppercase tracking-wide mb-2">
                      CARRIER
                    </label>
                    <Select
                      value={carrierOptions.find(opt => opt.value === shippingFormData.carrierType) || null}
                      onChange={handleCarrierTypeChange}
                      options={carrierOptions}
                      placeholder="SELECT CARRIER"
                      styles={selectStyles}
                      isSearchable={false}
                    />
                  </div>

                  {/* Tracker URL */}
                  <div>
                    <label className="block font-dm-sans text-sm text-white uppercase tracking-wide mb-2">
                      TRACKER URL
                    </label>
                    <input
                      type="text"
                      name="tracking_url"
                      value={shippingFormData.tracking_url}
                      onChange={handleShippingInputChange}
                      placeholder="ENTER TRACKER URL"
                      className="w-full bg-transparent border border-gray-500 rounded px-4 py-3 font-dm-sans text-sm focus:outline-none focus:border-white placeholder-gray-500"
                    />
                  </div>

                  {/* Custom Carrier Input (shown when "Other" is selected) */}
                  {shippingFormData.carrierType === 'other' && (
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="carrier"
                        value={shippingFormData.carrier}
                        onChange={handleShippingInputChange}
                        placeholder="ENTER CARRIER"
                        className="w-full bg-transparent border border-gray-500 rounded px-4 py-3 font-dm-sans text-sm focus:outline-none focus:border-white placeholder-gray-500"
                      />
                    </div>
                  )}

                  {/* Tracking Number */}
                  <div>
                    <label className="block font-dm-sans text-sm text-white uppercase tracking-wide mb-2">
                      TRACKING NUMBER
                    </label>
                    <input
                      type="text"
                      name="tracking_number"
                      value={shippingFormData.tracking_number}
                      onChange={handleShippingInputChange}
                      placeholder="ENTER TRACKING NUMBER"
                      className="w-full bg-transparent border border-gray-500 rounded px-4 py-3 font-dm-sans text-sm focus:outline-none focus:border-white placeholder-gray-500"
                    />
                  </div>

                  {/* Order Status Dropdown */}
                  <div>
                    <label className="block font-dm-sans text-sm text-white uppercase tracking-wide mb-2">
                      ORDER STATUS
                    </label>
                    <Select
                      value={orderStatusOptions.find(opt => opt.value === shippingFormData.orderStatus) || null}
                      onChange={handleOrderStatusChange}
                      options={orderStatusOptions}
                      placeholder="SELECT STATUS"
                      styles={selectStyles}
                      isSearchable={false}
                    />
                  </div>
                </div>

                {/* Update Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={updatingShipping}
                    className="bg-transparent border border-white text-white font-dm-sans text-sm px-8 py-3 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingShipping ? 'UPDATING...' : 'UPDATE'}
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-[#171F22] border border-gray-700 p-6 md:p-8 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-4">
              DELETE ORDER
            </h3>
            <p className="font-dm-sans text-gray-300 mb-6">
              Are you sure you want to delete Order #{selectedOrder?.id}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
                disabled={deletingOrder}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                disabled={deletingOrder}
                className="bg-red-600 border border-red-600 text-white font-dm-sans px-6 py-2 hover:bg-red-700 hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingOrder ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;