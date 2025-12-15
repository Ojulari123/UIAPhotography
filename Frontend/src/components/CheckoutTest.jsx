import { useState } from 'react';
import useOrderStore from '../stores/useOrderStore';
import useCartStore from '../stores/useCartStore';
import useAdminProductStore from '../stores/useAdminProductStore';
import useAdminPortfolioStore from '../stores/useAdminPortfolioStore';
import useAdminPicOfWeekStore from '../stores/useAdminPicOfWeekStore';
import usePortfolioStore from '../stores/usePortfolioStore';
import usePicOfWeekStore from '../stores/usePicOfWeekStore';
import { emailService } from '../api/emailService';
import apiClient from '../api/axiosConfig';

function CheckoutTest() {
  const { 
    createOrder, 
    calculateCheckoutTotal, 
    createPaymentIntent,
    currentOrder,
    checkoutInfo,
    paymentIntent,
    loading, 
    error 
  } = useOrderStore();
  
  const { cartItems, getTotalPrice } = useCartStore();
  
  const {
    addProductByUrl,
    deleteProduct,
    loading: adminLoading,
    error: adminError,
    successMessage: adminSuccess
  } = useAdminProductStore();

  const {
    addPortfolio,
    deletePortfolio,
    loading: portfolioLoading,
    error: portfolioError,
    successMessage: portfolioSuccess
  } = useAdminPortfolioStore();

  const {
    addPicOfWeek,
    deletePicOfWeek,
    loading: picLoading,
    error: picError,
    successMessage: picSuccess
  } = useAdminPicOfWeekStore();

  const {
    portfolios,
    fetchPortfolios,
    loading: portfolioFetchLoading
  } = usePortfolioStore();

  const {
    pics,
    fetchAllPics,
    loading: picFetchLoading
  } = usePicOfWeekStore();
  
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [newProductId, setNewProductId] = useState(null);
  const [newPortfolioId, setNewPortfolioId] = useState(null);
  const [newPicId, setNewPicId] = useState(null);

  // Test 1: Create Order (Digital Items - No Shipping)
  const testCreateDigitalOrder = async () => {
    try {
      const orderData = {
        customer_name: "Test Customer",
        customer_email: "test@example.com",
        items: cartItems.map(item => ({
          product_id: item.id,
          name: item.title,
          price: parseFloat(item.price),
          quantity: item.quantity,
          product_type: 'digital'
        }))
      };

      console.log('Creating digital order:', orderData);
      await createOrder(orderData);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  // Test 2: Create Order with Shipping (Physical Items)
  const testCreatePhysicalOrder = async () => {
    try {
      const orderData = {
        customer_name: "Test Customer",
        customer_email: "test@example.com",
        items: cartItems.map(item => ({
          product_id: item.id,
          name: item.title,
          price: parseFloat(item.price),
          quantity: item.quantity,
          product_type: 'physical'
        }))
      };

      const shippingData = {
        country_code: "US",
        address_line1: "123 Test Street",
        address_line2: "Apt 4B",
        city: "Los Angeles",
        state: "CA",
        postal_code: "90001"
      };

      console.log('Creating physical order with shipping:', { orderData, shippingData });
      await createOrder(orderData, shippingData, 'standard');
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  // Test 3: Calculate Total for existing order
  const testCalculateTotal = async () => {
    if (!currentOrder) {
      alert('Create an order first (Test 1 or 2)');
      return;
    }

    try {
      await calculateCheckoutTotal(currentOrder.id);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  // Test 4: Create Payment Intent (Stripe)
  const testPaymentIntent = async () => {
    try {
      const paymentData = {
        currency: "GBP",
        items: cartItems.map(item => ({
          product_id: item.id,
          name: item.title,
          price: parseFloat(item.price),
          quantity: item.quantity,
          product_type: 'physical'
        })),
        customer: {
          name: "Test Customer",
          email: "test@example.com",
          phone: "+1234567890"
        },
        shipping: {
          country_code: "US",
          address_line1: "123 Test Street",
          address_line2: "Apt 4B",
          city: "Los Angeles",
          state: "CA",
          postal_code: "90001"
        }
      };

      await createPaymentIntent(paymentData);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  // Test 5: Add Test Product
  const testAddProduct = async () => {
    try {
      const testProduct = {
        title: "TEST PRODUCT - DELETE ME",
        description: "This is a test product created for testing the delete function",
        image_url: "https://picsum.photos/400/600",
        price: 9.99,
        is_for_sale: true,
        dimensions: "A4",
        resolution: "300 DPI",
        file_size_mb: 2.5,
        file_format: "JPG"
      };

      console.log('Creating test product:', testProduct);
      const result = await addProductByUrl(testProduct);
      console.log('Test product created:', result);
      setNewProductId(result.id);
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  // Test 6: Delete Test Product
  const testDeleteProduct = async () => {
    if (!newProductId) {
      alert('Create a test product first (Test 5)');
      return;
    }

    if (!confirm(`Are you sure you want to delete product #${newProductId}?`)) {
      return;
    }

    try {
      console.log('Deleting test product:', newProductId);
      await deleteProduct(newProductId);
      console.log('Product deleted successfully');
      setNewProductId(null);
      
      // Refresh the page to see updated product list
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Test 7: Send Order Confirmation Email
  const testSendConfirmationEmail = async () => {
    if (!currentOrder) {
      alert('Create an order first (Test 1 or 2)');
      return;
    }

    setEmailLoading(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      console.log('Sending confirmation email for order:', currentOrder.id);
      const response = await emailService.sendOrderConfirmation(currentOrder.id);
      console.log('Email sent successfully:', response.data);
      setEmailSuccess('Order confirmation email sent successfully! ✅');
    } catch (err) {
      console.error('Email test failed:', err);
      setEmailError(err.response?.data?.detail || 'Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  // Test 8: Send Order Update Email
  const testSendUpdateEmail = async () => {
    if (!currentOrder) {
      alert('Create an order first (Test 1 or 2)');
      return;
    }

    setEmailLoading(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      console.log('Sending update email for order:', currentOrder.id);
      const response = await emailService.sendOrderUpdate(currentOrder.id);
      console.log('Update email sent successfully:', response.data);
      setEmailSuccess('Order update email sent successfully! ✅ (Order status changed to "shipped")');
    } catch (err) {
      console.error('Email test failed:', err);
      setEmailError(err.response?.data?.detail || 'Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  // Test 9: Add Shipping Info
  const testAddShippingInfo = async () => {
    if (!currentOrder) {
      alert('Create an order first');
      return;
    }

    setEmailLoading(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      const shippingInfo = {
        carrier: "Royal Mail",
        tracking_number: "RM123456789GB",
        tracking_url: "https://www.royalmail.com/track-your-item#/tracking-results/RM123456789GB"
      };

      console.log('Adding shipping info for order:', currentOrder.id);
      const response = await apiClient.post(`/input-shipping-info/${currentOrder.id}`, shippingInfo);
      console.log('Shipping info added:', response.data);
      setEmailSuccess('Shipping info added successfully! ✅');
    } catch (err) {
      console.error('Failed:', err);
      setEmailError(err.response?.data?.detail || 'Failed to add shipping info');
    } finally {
      setEmailLoading(false);
    }
  };

  // Test 10: View All Orders
  const testViewAllOrders = async () => {
    setEmailLoading(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      console.log('Fetching all orders...');
      const response = await apiClient.get('/view-orders');
      console.log('All orders:', response.data);
      setEmailSuccess(`Found ${response.data.length} orders! Check console for details.`);
    } catch (err) {
      console.error('Failed:', err);
      setEmailError(err.response?.data?.detail || 'Failed to fetch orders');
    } finally {
      setEmailLoading(false);
    }
  };

  // Test 11: Fetch All Portfolios
  const testFetchPortfolios = async () => {
    try {
      console.log('Fetching all portfolios...');
      await fetchPortfolios();
      console.log('Portfolios fetched:', portfolios);
    } catch (err) {
      console.error('Failed to fetch portfolios:', err);
    }
  };

  // Test 12: Add Test Portfolio
  const testAddPortfolio = async () => {
    try {
      // Create a test FormData
      const formData = new FormData();
      formData.append('title', 'TEST PORTFOLIO - DELETE ME');
      formData.append('category', 'nature');
      
      // Create a dummy image blob
      const response = await fetch('https://picsum.photos/400/600');
      const blob = await response.blob();
      const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
      
      formData.append('files', file);

      console.log('Creating test portfolio...');
      const result = await addPortfolio(formData);
      console.log('Test portfolio created:', result);
      setNewPortfolioId(result.id);
    } catch (err) {
      console.error('Failed to create portfolio:', err);
    }
  };

  // Test 13: Delete Test Portfolio
  const testDeletePortfolio = async () => {
    if (!newPortfolioId) {
      alert('Create a test portfolio first (Test 12)');
      return;
    }

    if (!confirm(`Are you sure you want to delete portfolio #${newPortfolioId}?`)) {
      return;
    }

    try {
      console.log('Deleting test portfolio:', newPortfolioId);
      await deletePortfolio(newPortfolioId);
      console.log('Portfolio deleted successfully');
      setNewPortfolioId(null);
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
    }
  };

  // Test 14: Fetch All Pics of the Week
  const testFetchPicsOfWeek = async () => {
    try {
      console.log('Fetching all pics of the week...');
      await fetchAllPics();
      console.log('Pics fetched:', pics);
    } catch (err) {
      console.error('Failed to fetch pics:', err);
    }
  };

  // Test 15: Add Test Pic & Poem
  const testAddPicOfWeek = async () => {
    try {
      // Create a test FormData
      const formData = new FormData();
      formData.append('poem', 'This is a test poem for the picture of the week. Delete me after testing!');
      
      // Create a dummy image blob
      const response = await fetch('https://picsum.photos/400/600');
      const blob = await response.blob();
      const file = new File([blob], 'test-pic.jpg', { type: 'image/jpeg' });
      
      formData.append('upload_file', file);

      console.log('Creating test pic of the week...');
      const result = await addPicOfWeek(formData);
      console.log('Test pic created:', result);
      setNewPicId(result.Pic_of_week.id);
    } catch (err) {
      console.error('Failed to create pic of week:', err);
    }
  };

  // Test 16: Delete Test Pic of Week
  const testDeletePicOfWeek = async () => {
    if (!newPicId) {
      alert('Create a test pic first (Test 15)');
      return;
    }

    if (!confirm(`Are you sure you want to delete pic #${newPicId}?`)) {
      return;
    }

    try {
      console.log('Deleting test pic of week:', newPicId);
      await deletePicOfWeek(newPicId);
      console.log('Pic deleted successfully');
      setNewPicId(null);
    } catch (err) {
      console.error('Failed to delete pic:', err);
    }
  };

  const isAnyLoading = loading || emailLoading || adminLoading || portfolioLoading || picLoading || portfolioFetchLoading || picFetchLoading;

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      margin: '20px', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🧪 Complete API Tests</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Current Cart Total:</strong> ${getTotalPrice().toFixed(2)}</p>
        <p><strong>Cart Items:</strong> {cartItems.length}</p>
        {currentOrder && (
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>
            ✅ Current Order ID: {currentOrder.id}
          </p>
        )}
        {newProductId && (
          <p style={{ color: '#17a2b8', fontWeight: 'bold' }}>
            ✅ Test Product ID: {newProductId}
          </p>
        )}
        {newPortfolioId && (
          <p style={{ color: '#6f42c1', fontWeight: 'bold' }}>
            ✅ Test Portfolio ID: {newPortfolioId}
          </p>
        )}
        {newPicId && (
          <p style={{ color: '#fd7e14', fontWeight: 'bold' }}>
            ✅ Test Pic ID: {newPicId}
          </p>
        )}
        {cartItems.length === 0 && (
          <p style={{ color: 'orange' }}>⚠️ Add items to cart first for order tests!</p>
        )}
      </div>

      {/* Orders & Checkout Tests */}
      <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>🛒 Order & Checkout Tests:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testCreateDigitalOrder} 
          disabled={isAnyLoading || cartItems.length === 0}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || cartItems.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || cartItems.length === 0) ? 0.6 : 1
          }}
        >
          Test 1: Create Order (Digital - No Shipping)
        </button>

        <button 
          onClick={testCreatePhysicalOrder} 
          disabled={isAnyLoading || cartItems.length === 0}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || cartItems.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || cartItems.length === 0) ? 0.6 : 1
          }}
        >
          Test 2: Create Order (Physical + Shipping)
        </button>

        <button 
          onClick={testCalculateTotal} 
          disabled={isAnyLoading || !currentOrder}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || !currentOrder) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || !currentOrder) ? 0.6 : 1
          }}
        >
          Test 3: Calculate Checkout Total
        </button>

        <button 
          onClick={testPaymentIntent} 
          disabled={isAnyLoading || cartItems.length === 0}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || cartItems.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || cartItems.length === 0) ? 0.6 : 1
          }}
        >
          Test 4: Create Stripe Payment Intent
        </button>
      </div>

      {/* Admin Product Tests */}
      <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>📦 Admin Product Tests:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testAddProduct} 
          disabled={isAnyLoading}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#20c997',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnyLoading ? 'not-allowed' : 'pointer',
            opacity: isAnyLoading ? 0.6 : 1
          }}
        >
          Test 5: Add Test Product ➕
        </button>

        <button 
          onClick={testDeleteProduct} 
          disabled={isAnyLoading || !newProductId}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || !newProductId) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || !newProductId) ? 0.6 : 1
          }}
        >
          Test 6: Delete Test Product ⚠️
        </button>
      </div>

      {/* Email & Admin Tests */}
      <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>📧 Email & Shipping Tests:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testSendConfirmationEmail} 
          disabled={isAnyLoading || !currentOrder}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || !currentOrder) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || !currentOrder) ? 0.6 : 1
          }}
        >
          Test 7: Send Order Confirmation Email 📧
        </button>

        <button 
          onClick={testSendUpdateEmail} 
          disabled={isAnyLoading || !currentOrder}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#e83e8c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || !currentOrder) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || !currentOrder) ? 0.6 : 1
          }}
        >
          Test 8: Send Order Update Email 📦
        </button>

        <button 
          onClick={testAddShippingInfo} 
          disabled={isAnyLoading || !currentOrder}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || !currentOrder) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || !currentOrder) ? 0.6 : 1
          }}
        >
          Test 9: Add Shipping/Tracking Info 🚚
        </button>

        <button 
          onClick={testViewAllOrders} 
          disabled={isAnyLoading}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#6610f2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnyLoading ? 'not-allowed' : 'pointer',
            opacity: isAnyLoading ? 0.6 : 1
          }}
        >
          Test 10: View All Orders 📋
        </button>
      </div>

      {/* Portfolio Tests */}
      <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>🖼️ Portfolio Tests:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testFetchPortfolios} 
          disabled={isAnyLoading}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnyLoading ? 'not-allowed' : 'pointer',
            opacity: isAnyLoading ? 0.6 : 1
          }}
        >
          Test 11: Fetch All Portfolios 🖼️
        </button>

        <button 
          onClick={testAddPortfolio} 
          disabled={isAnyLoading}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#20c997',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnyLoading ? 'not-allowed' : 'pointer',
            opacity: isAnyLoading ? 0.6 : 1
          }}
        >
          Test 12: Add Test Portfolio ➕
        </button>

        <button 
          onClick={testDeletePortfolio} 
          disabled={isAnyLoading || !newPortfolioId}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || !newPortfolioId) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || !newPortfolioId) ? 0.6 : 1
          }}
        >
          Test 13: Delete Test Portfolio ⚠️
        </button>
      </div>

      {/* Pic of Week Tests */}
      <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>📸 Pic & Poem of the Week Tests:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={testFetchPicsOfWeek} 
          disabled={isAnyLoading}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnyLoading ? 'not-allowed' : 'pointer',
            opacity: isAnyLoading ? 0.6 : 1
          }}
        >
          Test 14: Fetch All Pics of the Week 📸
        </button>

        <button 
          onClick={testAddPicOfWeek} 
          disabled={isAnyLoading}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#20c997',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnyLoading ? 'not-allowed' : 'pointer',
            opacity: isAnyLoading ? 0.6 : 1
          }}
        >
          Test 15: Add Test Pic & Poem ➕
        </button>

        <button 
          onClick={testDeletePicOfWeek} 
          disabled={isAnyLoading || !newPicId}
          style={{ 
            padding: '10px 15px', 
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (isAnyLoading || !newPicId) ? 'not-allowed' : 'pointer',
            opacity: (isAnyLoading || !newPicId) ? 0.6 : 1
          }}
        >
          Test 16: Delete Test Pic & Poem ⚠️
        </button>
      </div>

      {/* Loading Indicator */}
      {isAnyLoading && <p>⏳ Processing...</p>}

      {/* Success Messages */}
      {adminSuccess && (
        <div style={{ 
          color: '#155724', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#d4edda',
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          <h4>✅ Product Success:</h4>
          <p>{adminSuccess}</p>
        </div>
      )}

      {portfolioSuccess && (
        <div style={{ 
          color: '#155724', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#d4edda',
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          <h4>✅ Portfolio Success:</h4>
          <p>{portfolioSuccess}</p>
        </div>
      )}

      {picSuccess && (
        <div style={{ 
          color: '#155724', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#d4edda',
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          <h4>✅ Pic of Week Success:</h4>
          <p>{picSuccess}</p>
        </div>
      )}

      {emailSuccess && (
        <div style={{ 
          color: '#155724', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#d4edda',
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          <h4>✅ Email/Shipping Success:</h4>
          <p>{emailSuccess}</p>
        </div>
      )}

      {/* Error Messages */}
      {adminError && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#ffe6e6',
          borderRadius: '5px'
        }}>
          <h4>❌ Product Error:</h4>
          <p>{adminError}</p>
        </div>
      )}

      {portfolioError && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#ffe6e6',
          borderRadius: '5px'
        }}>
          <h4>❌ Portfolio Error:</h4>
          <p>{portfolioError}</p>
        </div>
      )}

      {picError && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#ffe6e6',
          borderRadius: '5px'
        }}>
          <h4>❌ Pic of Week Error:</h4>
          <p>{picError}</p>
        </div>
      )}

      {emailError && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#ffe6e6',
          borderRadius: '5px'
        }}>
          <h4>❌ Email/Shipping Error:</h4>
          <p>{emailError}</p>
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#ffe6e6',
          borderRadius: '5px'
        }}>
          <h4>❌ Order Error:</h4>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </p>
        </div>
      )}

      {/* Order Info Display */}
      {currentOrder && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
          <h4>✅ Order Created!</h4>
          <p><strong>Order ID:</strong> {currentOrder.id}</p>
          <p><strong>Customer:</strong> {currentOrder.customer_name}</p>
          <p><strong>Email:</strong> {currentOrder.customer_email}</p>
          <p><strong>Status:</strong> {currentOrder.status}</p>
          <p><strong>Total:</strong> £{currentOrder.order_total?.toFixed(2)}</p>
          <p><strong>Items:</strong> {currentOrder.items?.length}</p>
        </div>
      )}
      
      {checkoutInfo && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '5px' }}>
          <h4>💰 Checkout Info:</h4>
          <p><strong>Amount to Pay:</strong> £{checkoutInfo.amount_to_be_paid}</p>
          <p><strong>Payment Status:</strong> {checkoutInfo.payment_status}</p>
        </div>
      )}

      {paymentIntent && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
          <h4>💳 Payment Intent Created!</h4>
          <p><strong>Amount:</strong> £{paymentIntent.amount.toFixed(2)}</p>
          <p><strong>Currency:</strong> {paymentIntent.currency}</p>
          <p><strong>Client Secret:</strong> {paymentIntent.client_secret.substring(0, 30)}...</p>
        </div>
      )}

      {portfolios.length > 0 && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e7e3ff', borderRadius: '5px' }}>
          <h4>🖼️ Portfolios Fetched:</h4>
          <p><strong>Total:</strong> {portfolios.length}</p>
          <p>Check console for full details</p>
        </div>
      )}

      {pics.length > 0 && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
          <h4>📸 Pics of the Week Fetched:</h4>
          <p><strong>Total:</strong> {pics.length}</p>
          <p>Check console for full details</p>
        </div>
      )}
    </div>
  );
}

export default CheckoutTest;