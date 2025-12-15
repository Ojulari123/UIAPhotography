// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import useCartStore from '../stores/useCartStore';
// import useOrderStore from '../stores/useOrderStore';

// function CheckoutPage() {
//   const navigate = useNavigate();
//   const { cartItems, getTotalPrice, clearCart } = useCartStore();
//   const { createPaymentIntent, loading: orderLoading } = useOrderStore();

//   // Check if cart has physical products (need shipping)
//   const hasPhysicalProducts = cartItems.some(item => item.product_type === 'physical');

//   // Form state
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     mobileNumber: '',
//     countryCode: '',
//     city: '',
//     state: '',
//     postalCode: '',
//     addressLine1: '',
//     addressLine2: '',
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   // Format product type for display
//   const formatProductType = (type) => {
//     if (type === 'digital') return 'Digital';
//     if (type === 'physical') return 'Physical';
//     return type;
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // Calculate shipping (£10 flat rate for physical products)
//   const calculateShipping = () => {
//     return hasPhysicalProducts ? 10.00 : 0.00;
//   };

//   // Calculate estimated taxes (8% of subtotal)
//   const calculateTaxes = () => {
//     return getTotalPrice() * 0.08;
//   };

//   // Calculate total
//   const calculateTotal = () => {
//     return getTotalPrice() + calculateShipping() + calculateTaxes();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError(null);

//     try {
//       // Basic validation
//       if (!formData.fullName || !formData.email || !formData.mobileNumber) {
//         throw new Error('Please fill in all required fields');
//       }

//       if (hasPhysicalProducts) {
//         if (!formData.countryCode || !formData.city || !formData.state ||
//           !formData.postalCode || !formData.addressLine1) {
//           throw new Error('Please fill in all shipping details');
//         }
//       }

//       // Prepare order items matching backend CartItem schema
//       const orderItems = cartItems.map(item => ({
//         product_id: item.id,
//         name: item.title,
//         price: parseFloat(item.price),
//         quantity: item.quantity,
//         product_type: item.product_type // 'digital' or 'physical'
//       }));

//       // Prepare payment data matching backend PaymentIntentRequest schema
//       const paymentData = {
//         currency: 'gbp',
//         items: orderItems,
//         customer: {
//           name: formData.fullName,
//           email: formData.email,
//           phone: formData.mobileNumber
//         }
//       };

//       // Add shipping data if physical products exist (matching backend ShippingData schema)
//       if (hasPhysicalProducts) {
//         paymentData.shipping = {
//           country_code: formData.countryCode.toUpperCase(),
//           address_line1: formData.addressLine1,
//           address_line2: formData.addressLine2 || '',
//           city: formData.city,
//           state: formData.state,
//           postal_code: formData.postalCode
//         };
//       }

//       console.log('💳 Creating payment intent:', paymentData);
//       const paymentIntent = await createPaymentIntent(paymentData);
//       console.log('✅ Payment intent created:', paymentIntent);

//       // Clear cart and redirect to payment/success
//       clearCart();
      
//       // TODO: Use paymentIntent.client_secret with Stripe.js to complete payment
//       // For now, show success message
//       alert('Order created successfully! Redirecting to payment...');
//       navigate('/');

//     } catch (err) {
//       console.error('❌ Checkout error:', err);
      
//       let errorMessage = 'Failed to process checkout. Please try again.';
      
//       if (err.response?.data?.detail) {
//         if (Array.isArray(err.response.data.detail)) {
//           errorMessage = err.response.data.detail
//             .map(error => `${error.loc.join(' → ')}: ${error.msg}`)
//             .join(', ');
//         } else if (typeof err.response.data.detail === 'string') {
//           errorMessage = err.response.data.detail;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//       setSubmitting(false);
//     }
//   };

//   if (cartItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 font-dm-sans mb-4">Your cart is empty</p>
//           <Link
//             to="/products"
//             className="text-gray-900 font-dm-sans hover:underline"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12">
//         {/* Back to Cart Link */}
//         <Link
//           to="/cart"
//           className="flex items-center gap-2 text-gray-900 font-dm-sans text-sm mb-8"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           BACK TO CART
//         </Link>

//         {/* Checkout Title */}
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-dm-sans mb-8">
//           CHECKOUT
//         </h1>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
//             <p className="text-red-600 font-dm-sans text-sm">{error}</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Side - Form (2/3 width) */}
//           <div className="lg:col-span-2">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Full Name and Email */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     FULL NAME
//                   </label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     EMAIL
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>

//               {/* Mobile Number and Country Code */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     MOBILE NUMBER
//                   </label>
//                   <input
//                     type="tel"
//                     name="mobileNumber"
//                     value={formData.mobileNumber}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//                 {hasPhysicalProducts && (
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       COUNTRY CODE
//                     </label>
//                     <input
//                       type="text"
//                       name="countryCode"
//                       value={formData.countryCode}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       placeholder="e.g., US, UK, NG"
//                       required={hasPhysicalProducts}
//                       disabled={submitting}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Physical Product Fields */}
//               {hasPhysicalProducts && (
//                 <>
//                   {/* City, State, Postal Code */}
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         CITY
//                       </label>
//                       <input
//                         type="text"
//                         name="city"
//                         value={formData.city}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                     <div>
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         STATE
//                       </label>
//                       <input
//                         type="text"
//                         name="state"
//                         value={formData.state}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                     <div className="col-span-2 md:col-span-1">
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         POSTAL CODE
//                       </label>
//                       <input
//                         type="text"
//                         name="postalCode"
//                         value={formData.postalCode}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                   </div>

//                   {/* Address Line 1 */}
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       ADDRESS LINE 1
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine1"
//                       value={formData.addressLine1}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       required
//                       disabled={submitting}
//                     />
//                   </div>

//                   {/* Address Line 2 */}
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       ADDRESS LINE 2 (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine2"
//                       value={formData.addressLine2}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       disabled={submitting}
//                     />
//                   </div>
//                 </>
//               )}
//             </form>
//           </div>

//           {/* Right Side - Cart Summary (1/3 width) */}
//           <div className="lg:col-span-1">
//             <div className="border border-[#282C2D] rounded-lg p-6 sticky top-8">
//               <h2 className="text-xl font-bold text-gray-900 font-dm-sans mb-6">
//                 CART
//               </h2>

//               {/* Cart Items */}
//               <div className="space-y-4 mb-6">
//                 {cartItems.map((item) => (
//                   <div key={item.itemKey} className="flex gap-3">
//                     {/* Product Image with Quantity Badge */}
//                     <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
//                       <img
//                         src={item.image_url}
//                         alt={item.title}
//                         className="w-full h-full object-cover"
//                       />
//                       {/* Quantity Badge */}
//                       <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs font-dm-sans w-5 h-5 flex items-center justify-center rounded-bl">
//                         {item.quantity}
//                       </div>
//                     </div>

//                     {/* Product Details */}
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-dm-sans text-gray-900 text-sm font-medium truncate">
//                         {item.title}
//                       </h3>
//                       <p className="font-dm-sans text-gray-600 text-xs">
//                         {item.dimensions}
//                       </p>
//                       {/* Product Type/Format */}
//                       <p className="font-dm-sans text-gray-500 text-xs mt-1">
//                         {formatProductType(item.product_type)}
//                       </p>
//                     </div>

//                     {/* Price */}
//                     <div className="flex-shrink-0">
//                       <p className="font-dm-sans text-gray-900 text-sm font-medium">
//                         £{item.price}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider */}
//               <div className="border-t border-[#282C2D] mb-4"></div>

//               {/* Summary */}
//               <div className="space-y-3 mb-6">
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">SUBTOTAL</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{getTotalPrice().toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">SHIPPING</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{calculateShipping().toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">ESTIMATED TAXES</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{calculateTaxes().toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="border-t border-[#282C2D] mb-4"></div>

//               {/* Total */}
//               <div className="flex justify-between mb-6">
//                 <span className="font-dm-sans text-gray-900 text-base font-bold">TOTAL</span>
//                 <span className="font-dm-sans text-gray-900 text-base font-bold">
//                   £{calculateTotal().toFixed(2)}
//                 </span>
//               </div>

//               {/* Proceed to Payment Button */}
//               <button
//                 type="submit"
//                 onClick={handleSubmit}
//                 disabled={submitting || orderLoading}
//                 className="w-full bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base py-2 hover:bg-white hover:text-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {submitting || orderLoading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CheckoutPage;



// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import useCartStore from '../stores/useCartStore';
// import useOrderStore from '../stores/useOrderStore';
// import { emailService } from '../api/emailService';
// import apiClient from '../api/axiosConfig';

// function CheckoutPage() {
//   const navigate = useNavigate();
//   const { cartItems, getTotalPrice, clearCart } = useCartStore();
//   const { createPaymentIntent, loading: orderLoading } = useOrderStore();

//   // Check if cart has physical products (need shipping)
//   const hasPhysicalProducts = cartItems.some(item => item.product_type === 'physical');

//   // Form state
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     mobileNumber: '',
//     countryCode: '',
//     city: '',
//     state: '',
//     postalCode: '',
//     addressLine1: '',
//     addressLine2: '',
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   // Format product type for display
//   const formatProductType = (type) => {
//     if (type === 'digital') return 'Digital';
//     if (type === 'physical') return 'Physical';
//     return type;
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // Calculate shipping (£10 flat rate for physical products)
//   const calculateShipping = () => {
//     return hasPhysicalProducts ? 10.00 : 0.00;
//   };

//   // Calculate estimated taxes (8% of subtotal)
//   const calculateTaxes = () => {
//     return getTotalPrice() * 0.08;
//   };

//   // Calculate total
//   const calculateTotal = () => {
//     return getTotalPrice() + calculateShipping() + calculateTaxes();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError(null);

//     try {
//       // Basic validation
//       if (!formData.fullName || !formData.email || !formData.mobileNumber) {
//         throw new Error('Please fill in all required fields');
//       }

//       if (hasPhysicalProducts) {
//         if (!formData.countryCode || !formData.city || !formData.state ||
//           !formData.postalCode || !formData.addressLine1) {
//           throw new Error('Please fill in all shipping details');
//         }
//       }

//       // Prepare order items matching backend CartItem schema
//       const orderItems = cartItems.map(item => ({
//         product_id: item.id,
//         name: item.title,
//         price: parseFloat(item.price),
//         quantity: item.quantity,
//         product_type: item.product_type // 'digital' or 'physical'
//       }));

//       // ============================================================
//       // TESTING: Create order directly using /order endpoint
//       // This returns order_id which we need to send confirmation email
//       // In production, remove this and use createPaymentIntent with Stripe webhook
//       // ============================================================
      
//       // Prepare order data matching backend CreateOrder schema
//       const orderData = {
//         customer_name: formData.fullName,
//         customer_email: formData.email,
//         phone_number: formData.mobileNumber,
//         items: orderItems
//       };

//       // Build request with shipping if physical products
//       const requestBody = {
//         order_data: orderData
//       };

//       if (hasPhysicalProducts) {
//         requestBody.shipping = {
//           country_code: formData.countryCode.toUpperCase(),
//           address_line1: formData.addressLine1,
//           address_line2: formData.addressLine2 || '',
//           city: formData.city,
//           state: formData.state,
//           postal_code: formData.postalCode
//         };
//       }

//       console.log('📦 Creating order for email test:', requestBody);
//       const orderResponse = await apiClient.post('/order?shipping_type=standard', requestBody);
//       console.log('✅ Order created:', orderResponse.data);

//       const orderId = orderResponse.data.id;
//       console.log('📧 Sending confirmation email for order:', orderId);
      
//       // Send confirmation email
//       try {
//         await emailService.sendOrderConfirmation(orderId);
//         console.log('✅ Confirmation email sent successfully!');
//       } catch (emailErr) {
//         console.error('⚠️ Email sending failed:', emailErr);
//         // Don't fail the whole checkout if email fails
//       }

//       // ============================================================
//       // END TESTING CODE
//       // ============================================================

//       // Clear cart and redirect
//       clearCart();
      
//       alert(`Order #${orderId} created! Confirmation email sent to ${formData.email}`);
//       navigate('/');

//     } catch (err) {
//       console.error('❌ Checkout error:', err);
      
//       let errorMessage = 'Failed to process checkout. Please try again.';
      
//       if (err.response?.data?.detail) {
//         if (Array.isArray(err.response.data.detail)) {
//           errorMessage = err.response.data.detail
//             .map(error => `${error.loc?.join(' → ') || ''}: ${error.msg}`)
//             .join(', ');
//         } else if (typeof err.response.data.detail === 'string') {
//           errorMessage = err.response.data.detail;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//       setSubmitting(false);
//     }
//   };

//   if (cartItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 font-dm-sans mb-4">Your cart is empty</p>
//           <Link
//             to="/products"
//             className="text-gray-900 font-dm-sans hover:underline"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12">
//         {/* Back to Cart Link */}
//         <Link
//           to="/cart"
//           className="flex items-center gap-2 text-gray-900 font-dm-sans text-sm mb-8"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           BACK TO CART
//         </Link>

//         {/* Checkout Title */}
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-dm-sans mb-8">
//           CHECKOUT
//         </h1>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
//             <p className="text-red-600 font-dm-sans text-sm">{error}</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Side - Form (2/3 width) */}
//           <div className="lg:col-span-2">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Full Name and Email */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     FULL NAME
//                   </label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     EMAIL
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>

//               {/* Mobile Number and Country Code */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     MOBILE NUMBER
//                   </label>
//                   <input
//                     type="tel"
//                     name="mobileNumber"
//                     value={formData.mobileNumber}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//                 {hasPhysicalProducts && (
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       COUNTRY CODE
//                     </label>
//                     <input
//                       type="text"
//                       name="countryCode"
//                       value={formData.countryCode}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       placeholder="e.g., US, UK, NG"
//                       required={hasPhysicalProducts}
//                       disabled={submitting}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Physical Product Fields */}
//               {hasPhysicalProducts && (
//                 <>
//                   {/* City, State, Postal Code */}
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         CITY
//                       </label>
//                       <input
//                         type="text"
//                         name="city"
//                         value={formData.city}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                     <div>
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         STATE
//                       </label>
//                       <input
//                         type="text"
//                         name="state"
//                         value={formData.state}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                     <div className="col-span-2 md:col-span-1">
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         POSTAL CODE
//                       </label>
//                       <input
//                         type="text"
//                         name="postalCode"
//                         value={formData.postalCode}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                   </div>

//                   {/* Address Line 1 */}
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       ADDRESS LINE 1
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine1"
//                       value={formData.addressLine1}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       required
//                       disabled={submitting}
//                     />
//                   </div>

//                   {/* Address Line 2 */}
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       ADDRESS LINE 2 (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine2"
//                       value={formData.addressLine2}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       disabled={submitting}
//                     />
//                   </div>
//                 </>
//               )}
//             </form>
//           </div>

//           {/* Right Side - Cart Summary (1/3 width) */}
//           <div className="lg:col-span-1">
//             <div className="border border-[#282C2D] rounded-lg p-6 sticky top-8">
//               <h2 className="text-xl font-bold text-gray-900 font-dm-sans mb-6">
//                 CART
//               </h2>

//               {/* Cart Items */}
//               <div className="space-y-4 mb-6">
//                 {cartItems.map((item) => (
//                   <div key={item.itemKey} className="flex gap-3">
//                     {/* Product Image with Quantity Badge */}
//                     <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
//                       <img
//                         src={item.image_url}
//                         alt={item.title}
//                         className="w-full h-full object-cover"
//                       />
//                       {/* Quantity Badge */}
//                       <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs font-dm-sans w-5 h-5 flex items-center justify-center rounded-bl">
//                         {item.quantity}
//                       </div>
//                     </div>

//                     {/* Product Details */}
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-dm-sans text-gray-900 text-sm font-medium truncate">
//                         {item.title}
//                       </h3>
//                       <p className="font-dm-sans text-gray-600 text-xs">
//                         {item.dimensions}
//                       </p>
//                       {/* Product Type/Format */}
//                       <p className="font-dm-sans text-gray-500 text-xs mt-1">
//                         {formatProductType(item.product_type)}
//                       </p>
//                     </div>

//                     {/* Price */}
//                     <div className="flex-shrink-0">
//                       <p className="font-dm-sans text-gray-900 text-sm font-medium">
//                         £{item.price}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider */}
//               <div className="border-t border-[#282C2D] mb-4"></div>

//               {/* Summary */}
//               <div className="space-y-3 mb-6">
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">SUBTOTAL</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{getTotalPrice().toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">SHIPPING</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{calculateShipping().toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">ESTIMATED TAXES</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{calculateTaxes().toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="border-t border-[#282C2D] mb-4"></div>

//               {/* Total */}
//               <div className="flex justify-between mb-6">
//                 <span className="font-dm-sans text-gray-900 text-base font-bold">TOTAL</span>
//                 <span className="font-dm-sans text-gray-900 text-base font-bold">
//                   £{calculateTotal().toFixed(2)}
//                 </span>
//               </div>

//               {/* Proceed to Payment Button */}
//               <button
//                 type="submit"
//                 onClick={handleSubmit}
//                 disabled={submitting || orderLoading}
//                 className="w-full bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base py-2 hover:bg-white hover:text-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {submitting || orderLoading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CheckoutPage;



// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import useCartStore from '../stores/useCartStore';
// import useOrderStore from '../stores/useOrderStore';

// function CheckoutPage() {
//   const navigate = useNavigate();
//   const { cartItems, getTotalPrice, clearCart } = useCartStore();
//   const { createPaymentIntent, loading: orderLoading } = useOrderStore();

//   // Check if cart has physical products (need shipping)
//   const hasPhysicalProducts = cartItems.some(item => item.product_type === 'physical');

//   // Form state
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     mobileNumber: '',
//     countryCode: '',
//     city: '',
//     state: '',
//     postalCode: '',
//     addressLine1: '',
//     addressLine2: '',
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   // Format product type for display
//   const formatProductType = (type) => {
//     if (type === 'digital') return 'Digital';
//     if (type === 'physical') return 'Physical';
//     return type;
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // Calculate shipping (£10 flat rate for physical products)
//   const calculateShipping = () => {
//     return hasPhysicalProducts ? 10.00 : 0.00;
//   };

//   // Calculate estimated taxes (8% of subtotal)
//   const calculateTaxes = () => {
//     return getTotalPrice() * 0.08;
//   };

//   // Calculate total
//   const calculateTotal = () => {
//     return getTotalPrice() + calculateShipping() + calculateTaxes();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError(null);

//     try {
//       // Basic validation
//       if (!formData.fullName || !formData.email || !formData.mobileNumber) {
//         throw new Error('Please fill in all required fields');
//       }

//       if (hasPhysicalProducts) {
//         if (!formData.countryCode || !formData.city || !formData.state ||
//           !formData.postalCode || !formData.addressLine1) {
//           throw new Error('Please fill in all shipping details');
//         }
//       }

//       // Prepare order items matching backend CartItem schema
//       const orderItems = cartItems.map(item => ({
//         product_id: item.id,
//         name: item.title,
//         price: parseFloat(item.price),
//         quantity: item.quantity,
//         product_type: item.product_type // 'digital' or 'physical'
//       }));

//       // Prepare payment data matching backend PaymentIntentRequest schema
//       const paymentData = {
//         currency: 'gbp',
//         items: orderItems,
//         customer: {
//           name: formData.fullName,
//           email: formData.email,
//           phone: formData.mobileNumber
//         }
//       };

//       // Add shipping data if physical products exist (matching backend ShippingData schema)
//       if (hasPhysicalProducts) {
//         paymentData.shipping = {
//           country_code: formData.countryCode.toUpperCase(),
//           address_line1: formData.addressLine1,
//           address_line2: formData.addressLine2 || '',
//           city: formData.city,
//           state: formData.state,
//           postal_code: formData.postalCode
//         };
//       }

//       console.log('💳 Creating payment intent:', paymentData);
//       const paymentIntent = await createPaymentIntent(paymentData);
//       console.log('✅ Payment intent created:', paymentIntent);

//       // Clear cart
//       clearCart();
      
//       // TODO: Redirect to Stripe checkout using paymentIntent.client_secret
//       // For now, redirect to home (Stripe integration will handle the actual payment flow)
//       navigate('/');

//     } catch (err) {
//       console.error('❌ Checkout error:', err);
      
//       let errorMessage = 'Failed to process checkout. Please try again.';
      
//       if (err.response?.data?.detail) {
//         if (Array.isArray(err.response.data.detail)) {
//           errorMessage = err.response.data.detail
//             .map(error => `${error.loc?.join(' → ') || ''}: ${error.msg}`)
//             .join(', ');
//         } else if (typeof err.response.data.detail === 'string') {
//           errorMessage = err.response.data.detail;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//       setSubmitting(false);
//     }
//   };

//   if (cartItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 font-dm-sans mb-4">Your cart is empty</p>
//           <Link
//             to="/products"
//             className="text-gray-900 font-dm-sans hover:underline"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12">
//         {/* Back to Cart Link */}
//         <Link
//           to="/cart"
//           className="flex items-center gap-2 text-gray-900 font-dm-sans text-sm mb-8"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           BACK TO CART
//         </Link>

//         {/* Checkout Title */}
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-dm-sans mb-8">
//           CHECKOUT
//         </h1>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
//             <p className="text-red-600 font-dm-sans text-sm">{error}</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Side - Form (2/3 width) */}
//           <div className="lg:col-span-2">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Full Name and Email */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     FULL NAME
//                   </label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     EMAIL
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//               </div>

//               {/* Mobile Number and Country Code */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                     MOBILE NUMBER
//                   </label>
//                   <input
//                     type="tel"
//                     name="mobileNumber"
//                     value={formData.mobileNumber}
//                     onChange={handleChange}
//                     className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                     required
//                     disabled={submitting}
//                   />
//                 </div>
//                 {hasPhysicalProducts && (
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       COUNTRY CODE
//                     </label>
//                     <input
//                       type="text"
//                       name="countryCode"
//                       value={formData.countryCode}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       placeholder="e.g., US, UK, NG"
//                       required={hasPhysicalProducts}
//                       disabled={submitting}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Physical Product Fields */}
//               {hasPhysicalProducts && (
//                 <>
//                   {/* City, State, Postal Code */}
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         CITY
//                       </label>
//                       <input
//                         type="text"
//                         name="city"
//                         value={formData.city}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                     <div>
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         STATE
//                       </label>
//                       <input
//                         type="text"
//                         name="state"
//                         value={formData.state}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                     <div className="col-span-2 md:col-span-1">
//                       <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                         POSTAL CODE
//                       </label>
//                       <input
//                         type="text"
//                         name="postalCode"
//                         value={formData.postalCode}
//                         onChange={handleChange}
//                         className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                         required
//                         disabled={submitting}
//                       />
//                     </div>
//                   </div>

//                   {/* Address Line 1 */}
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       ADDRESS LINE 1
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine1"
//                       value={formData.addressLine1}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       required
//                       disabled={submitting}
//                     />
//                   </div>

//                   {/* Address Line 2 */}
//                   <div>
//                     <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
//                       ADDRESS LINE 2 (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       name="addressLine2"
//                       value={formData.addressLine2}
//                       onChange={handleChange}
//                       className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
//                       disabled={submitting}
//                     />
//                   </div>
//                 </>
//               )}
//             </form>
//           </div>

//           {/* Right Side - Cart Summary (1/3 width) */}
//           <div className="lg:col-span-1">
//             <div className="border border-[#282C2D] rounded-lg p-6 sticky top-8">
//               <h2 className="text-xl font-bold text-gray-900 font-dm-sans mb-6">
//                 CART
//               </h2>

//               {/* Cart Items */}
//               <div className="space-y-4 mb-6">
//                 {cartItems.map((item) => (
//                   <div key={item.itemKey} className="flex gap-3">
//                     {/* Product Image with Quantity Badge */}
//                     <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
//                       <img
//                         src={item.image_url}
//                         alt={item.title}
//                         className="w-full h-full object-cover"
//                       />
//                       {/* Quantity Badge */}
//                       <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs font-dm-sans w-5 h-5 flex items-center justify-center rounded-bl">
//                         {item.quantity}
//                       </div>
//                     </div>

//                     {/* Product Details */}
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-dm-sans text-gray-900 text-sm font-medium truncate">
//                         {item.title}
//                       </h3>
//                       <p className="font-dm-sans text-gray-600 text-xs">
//                         {item.dimensions}
//                       </p>
//                       {/* Product Type/Format */}
//                       <p className="font-dm-sans text-gray-500 text-xs mt-1">
//                         {formatProductType(item.product_type)}
//                       </p>
//                     </div>

//                     {/* Price */}
//                     <div className="flex-shrink-0">
//                       <p className="font-dm-sans text-gray-900 text-sm font-medium">
//                         £{item.price}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Divider */}
//               <div className="border-t border-[#282C2D] mb-4"></div>

//               {/* Summary */}
//               <div className="space-y-3 mb-6">
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">SUBTOTAL</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{getTotalPrice().toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">SHIPPING</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{calculateShipping().toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-dm-sans text-gray-900 text-sm">ESTIMATED TAXES</span>
//                   <span className="font-dm-sans text-gray-900 text-sm font-medium">
//                     £{calculateTaxes().toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="border-t border-[#282C2D] mb-4"></div>

//               {/* Total */}
//               <div className="flex justify-between mb-6">
//                 <span className="font-dm-sans text-gray-900 text-base font-bold">TOTAL</span>
//                 <span className="font-dm-sans text-gray-900 text-base font-bold">
//                   £{calculateTotal().toFixed(2)}
//                 </span>
//               </div>

//               {/* Proceed to Payment Button */}
//               <button
//                 type="submit"
//                 onClick={handleSubmit}
//                 disabled={submitting || orderLoading}
//                 className="w-full bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base py-2 hover:bg-white hover:text-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {submitting || orderLoading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CheckoutPage;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useCartStore from '../stores/useCartStore';
import useOrderStore from '../stores/useOrderStore';

// Initialize Stripe with your live public key
const stripePromise = loadStripe('pk_live_51Ry3jz1nKGsVuoHo3cf9fl9XaW57j6C2glO1FRb5CT3ffgI8UFnzUsFM4ovk89Gk4PjwJWiUvMNKgvXMwZUWJufq00TBvYOE1p');

// Payment Form Component (uses Stripe hooks)
function PaymentForm({ clientSecret, formData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              name: formData.fullName,
              email: formData.email,
              phone: formData.mobileNumber,
            }
          }
        },
      });

      // If error, it means payment didn't redirect (card error, etc.)
      if (error) {
        onError(error.message);
      }
    } catch (err) {
      onError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base py-3 hover:bg-white hover:text-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'PROCESSING PAYMENT...' : 'PAY NOW'}
      </button>
    </form>
  );
}

function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const { createPaymentIntent, loading: orderLoading } = useOrderStore();

  // Check if cart has physical products (need shipping)
  const hasPhysicalProducts = cartItems.some(item => item.product_type === 'physical');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    countryCode: '',
    city: '',
    state: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Format product type for display
  const formatProductType = (type) => {
    if (type === 'digital') return 'Digital';
    if (type === 'physical') return 'Physical';
    return type;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate shipping (£10 flat rate for physical products)
  const calculateShipping = () => {
    return hasPhysicalProducts ? 10.00 : 0.00;
  };

  // Calculate estimated taxes (8% of subtotal)
  const calculateTaxes = () => {
    return getTotalPrice() * 0.08;
  };

  // Calculate total
  const calculateTotal = () => {
    return getTotalPrice() + calculateShipping() + calculateTaxes();
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.fullName || !formData.email || !formData.mobileNumber) {
        throw new Error('Please fill in all required fields');
      }

      if (hasPhysicalProducts) {
        if (!formData.countryCode || !formData.city || !formData.state ||
          !formData.postalCode || !formData.addressLine1) {
          throw new Error('Please fill in all shipping details');
        }
      }

      // Prepare order items matching backend CartItem schema
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        name: item.title,
        price: parseFloat(item.price),
        quantity: item.quantity,
        product_type: item.product_type
      }));

      // Prepare payment data matching backend PaymentIntentRequest schema
      const paymentData = {
        currency: 'gbp',
        items: orderItems,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.mobileNumber
        }
      };

      // Add shipping data if physical products exist
      if (hasPhysicalProducts) {
        paymentData.shipping = {
          country_code: formData.countryCode.toUpperCase(),
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2 || '',
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode
        };
      }

      console.log('💳 Creating payment intent:', paymentData);
      const paymentIntent = await createPaymentIntent(paymentData);
      console.log('✅ Payment intent created:', paymentIntent);

      // Set client secret and show payment form
      setClientSecret(paymentIntent.client_secret);
      setShowPaymentForm(true);

    } catch (err) {
      console.error('❌ Checkout error:', err);
      
      let errorMessage = 'Failed to process checkout. Please try again.';
      
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
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentError = (message) => {
    setError(message);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-dm-sans mb-4">Your cart is empty</p>
          <Link
            to="/products"
            className="text-gray-900 font-dm-sans hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Stripe Elements appearance options
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#282C2D',
      fontFamily: '"DM Sans", sans-serif',
    },
  };

  const elementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12">
        {/* Back to Cart Link */}
        <Link
          to="/cart"
          className="flex items-center gap-2 text-gray-900 font-dm-sans text-sm mb-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          BACK TO CART
        </Link>

        {/* Checkout Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-dm-sans mb-8">
          {showPaymentForm ? 'PAYMENT' : 'CHECKOUT'}
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 font-dm-sans text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form or Payment (2/3 width) */}
          <div className="lg:col-span-2">
            {showPaymentForm && clientSecret ? (
              // Payment Form with Stripe Elements
              <div>
                <p className="text-gray-600 font-dm-sans mb-6">
                  Complete your payment below. Your card details are securely processed by Stripe.
                </p>
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <PaymentForm 
                    clientSecret={clientSecret}
                    formData={formData}
                    onError={handlePaymentError}
                  />
                </Elements>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="mt-4 text-gray-600 font-dm-sans text-sm hover:underline"
                >
                  ← Back to checkout details
                </button>
              </div>
            ) : (
              // Checkout Form
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                {/* Full Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Mobile Number and Country Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                      MOBILE NUMBER
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                      required
                      disabled={submitting}
                    />
                  </div>
                  {hasPhysicalProducts && (
                    <div>
                      <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                        COUNTRY CODE
                      </label>
                      <input
                        type="text"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                        placeholder="e.g., US, UK, NG"
                        required={hasPhysicalProducts}
                        disabled={submitting}
                      />
                    </div>
                  )}
                </div>

                {/* Physical Product Fields */}
                {hasPhysicalProducts && (
                  <>
                    {/* City, State, Postal Code */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                          CITY
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                          STATE
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                          POSTAL CODE
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                        ADDRESS LINE 1
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                        required
                        disabled={submitting}
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block font-dm-sans text-gray-900 text-sm font-medium mb-2">
                        ADDRESS LINE 2 (Optional)
                      </label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        className="w-full border border-[#282C2D] rounded px-4 py-3 font-dm-sans text-gray-900 focus:outline-none focus:border-[#282C2D]"
                        disabled={submitting}
                      />
                    </div>
                  </>
                )}

                {/* Submit button inside form for mobile */}
                <button
                  type="submit"
                  disabled={submitting || orderLoading}
                  className="w-full lg:hidden bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base py-3 hover:bg-white hover:text-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting || orderLoading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
                </button>
              </form>
            )}
          </div>

          {/* Right Side - Cart Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="border border-[#282C2D] rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 font-dm-sans mb-6">
                CART
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.itemKey} className="flex gap-3">
                    {/* Product Image with Quantity Badge */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Quantity Badge */}
                      <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs font-dm-sans w-5 h-5 flex items-center justify-center rounded-bl">
                        {item.quantity}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-dm-sans text-gray-900 text-sm font-medium truncate">
                        {item.title}
                      </h3>
                      <p className="font-dm-sans text-gray-600 text-xs">
                        {item.dimensions}
                      </p>
                      {/* Product Type/Format */}
                      <p className="font-dm-sans text-gray-500 text-xs mt-1">
                        {formatProductType(item.product_type)}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0">
                      <p className="font-dm-sans text-gray-900 text-sm font-medium">
                        £{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-[#282C2D] mb-4"></div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-dm-sans text-gray-900 text-sm">SUBTOTAL</span>
                  <span className="font-dm-sans text-gray-900 text-sm font-medium">
                    £{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-dm-sans text-gray-900 text-sm">SHIPPING</span>
                  <span className="font-dm-sans text-gray-900 text-sm font-medium">
                    £{calculateShipping().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-dm-sans text-gray-900 text-sm">ESTIMATED TAXES</span>
                  <span className="font-dm-sans text-gray-900 text-sm font-medium">
                    £{calculateTaxes().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#282C2D] mb-4"></div>

              {/* Total */}
              <div className="flex justify-between mb-6">
                <span className="font-dm-sans text-gray-900 text-base font-bold">TOTAL</span>
                <span className="font-dm-sans text-gray-900 text-base font-bold">
                  £{calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* Proceed to Payment Button - Desktop only, hidden when showing payment form */}
              {!showPaymentForm && (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={submitting || orderLoading}
                  className="hidden lg:block w-full bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base py-2 hover:bg-white hover:text-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting || orderLoading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;