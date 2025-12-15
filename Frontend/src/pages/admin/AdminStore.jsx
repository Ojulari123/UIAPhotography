// import { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import useAdminProductStore from '../../stores/useAdminProductStore';
// import AdminNotification from '../../components/AdminNotification';

// function AdminStore() {
//   const location = useLocation();
  
//   // Zustand store
//   const { products, fetchProducts, loading, editProduct, addProductMetafield, deleteProduct, addProductByFile } = useAdminProductStore();

//   // Mobile menu state
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Add product modal state
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [adding, setAdding] = useState(false);
//   const [addFormData, setAddFormData] = useState({
//     title: '',
//     description: '',
//     price: '',
//     dimensions: '',
//     is_for_sale: true
//   });
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);

//   // Edit modal state
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   // Delete modal state
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deletingProduct, setDeletingProduct] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   // Edit form state - using correct backend field names
//   const [editFormData, setEditFormData] = useState({
//     title: '',
//     description: '',
//     price: '',
//     is_for_sale: true,
//     dimensions: '',
//     resolution: '',
//     file_size_mb: '',
//     file_format: ''
//   });

//   // Notification state
//   const [notification, setNotification] = useState({
//     isVisible: false,
//     message: ''
//   });

//   // Stats state
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     availableProducts: 0,
//     unavailableProducts: 0
//   });

//   // Show notification helper
//   const showNotification = (message) => {
//     setNotification({
//       isVisible: true,
//       message
//     });
//   };

//   // Close notification helper
//   const closeNotification = () => {
//     setNotification({
//       isVisible: false,
//       message: ''
//     });
//   };

//   // Fetch data on mount
//   useEffect(() => {
//     console.log('📊 Fetching products data...');
//     fetchProducts();
//   }, [fetchProducts]);

//   // Log fetched data for debugging
//   useEffect(() => {
//     console.log('📦 Products received:', products);
//   }, [products]);

//   // Calculate stats from real data
//   useEffect(() => {
//     console.log('🔢 Calculating stats...');
    
//     const totalProducts = products.length;
    
//     const availableProducts = products.filter(product => 
//       product.is_for_sale === true
//     ).length;

//     const unavailableProducts = products.filter(product => 
//       product.is_for_sale === false
//     ).length;

//     const calculatedStats = {
//       totalProducts,
//       availableProducts,
//       unavailableProducts
//     };

//     console.log('📊 Calculated Stats:', calculatedStats);
//     setStats(calculatedStats);
//   }, [products]);

//   const isActive = (path) => location.pathname === path;

//   // Get all products (reversed to show newest first)
//   const productsToDisplay = [...products].reverse();

//   console.log('📋 Products to display:', productsToDisplay);

//   // Handle add product modal open
//   const handleAddProduct = () => {
//     setShowAddModal(true);
//   };

//   // Handle add form input changes
//   const handleAddInputChange = (e) => {
//     const { name, value } = e.target;
//     setAddFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle add form availability change
//   const handleAddAvailabilityChange = (value) => {
//     setAddFormData(prev => ({
//       ...prev,
//       is_for_sale: value
//     }));
//   };

//   // Handle image selection
//   const handleImageSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedImage(file);
//       // Create preview URL
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
//     }
//   };

//   // Reset add form
//   const resetAddForm = () => {
//     setAddFormData({
//       title: '',
//       description: '',
//       price: '',
//       dimensions: '',
//       is_for_sale: true
//     });
//     setSelectedImage(null);
//     setImagePreview(null);
//   };

//   // Handle add form submission
//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     setAdding(true);

//     try {
//       // Validation
//       if (!selectedImage) {
//         throw new Error('Please select an image');
//       }
//       if (!addFormData.title) {
//         throw new Error('Please enter a product title');
//       }
//       if (!addFormData.price) {
//         throw new Error('Please enter a product price');
//       }

//       // Create FormData for file upload
//       const formData = new FormData();
//       formData.append('image_file', selectedImage);
//       formData.append('title', addFormData.title);
//       formData.append('description', addFormData.description || '');
//       formData.append('price', parseFloat(addFormData.price));
//       formData.append('is_for_sale', addFormData.is_for_sale);
//       if (addFormData.dimensions) {
//         formData.append('dimensions', addFormData.dimensions);
//       }

//       console.log('📤 Adding product...');
//       await addProductByFile(formData);

//       // Show success notification
//       showNotification('Product added successfully!');

//       // Refresh products list
//       fetchProducts();

//       // Close modal after short delay
//       setTimeout(() => {
//         resetAddForm();
//         setShowAddModal(false);
//       }, 1500);

//     } catch (err) {
//       console.error('❌ Error adding product:', err);
      
//       let errorMessage = 'Failed to add product. Please try again.';
//       if (err.response?.data?.detail) {
//         if (typeof err.response.data.detail === 'string') {
//           errorMessage = err.response.data.detail;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       showNotification(errorMessage);
//     } finally {
//       setAdding(false);
//     }
//   };

//   const handleEditProduct = (productId) => {
//     // Find the product to edit
//     const product = products.find(p => p.id === productId);
//     if (product) {
//       setEditingProduct(product);
//       setEditFormData({
//         title: product.title || '',
//         description: product.description || '',
//         price: product.price || '',
//         is_for_sale: product.is_for_sale !== false,
//         dimensions: product.dimensions || '',
//         resolution: product.resolution || '',
//         file_size_mb: product.file_size_mb || '',
//         file_format: product.file_format || ''
//       });
//       setShowEditModal(true);
//     }
//   };

//   const handleDeleteProduct = (productId) => {
//     // Find the product to delete
//     const product = products.find(p => p.id === productId);
//     if (product) {
//       setDeletingProduct(product);
//       setShowDeleteModal(true);
//     }
//   };

//   // Confirm delete product
//   const confirmDeleteProduct = async () => {
//     if (!deletingProduct) return;
    
//     setDeleting(true);
//     try {
//       console.log('🗑️ Deleting product:', deletingProduct.id);
//       await deleteProduct(deletingProduct.id);
      
//       // Show success notification
//       showNotification(`"${deletingProduct.title}" deleted successfully!`);
      
//       // Refresh products list
//       fetchProducts();
      
//       // Close modal
//       setShowDeleteModal(false);
//       setDeletingProduct(null);
      
//     } catch (err) {
//       console.error('❌ Error deleting product:', err);
      
//       let errorMessage = 'Failed to delete product. Please try again.';
//       if (err.response?.data?.detail) {
//         if (typeof err.response.data.detail === 'string') {
//           errorMessage = err.response.data.detail;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       showNotification(errorMessage);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Cancel delete
//   const cancelDelete = () => {
//     setShowDeleteModal(false);
//     setDeletingProduct(null);
//   };

//   // Handle edit form input changes
//   const handleEditInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle availability change
//   const handleAvailabilityChange = (value) => {
//     setEditFormData(prev => ({
//       ...prev,
//       is_for_sale: value
//     }));
//   };

//   // Reset edit form
//   const resetEditForm = () => {
//     setEditFormData({
//       title: '',
//       description: '',
//       price: '',
//       is_for_sale: true,
//       dimensions: '',
//       resolution: '',
//       file_size_mb: '',
//       file_format: ''
//     });
//     setEditingProduct(null);
//   };

//   // Handle edit form submission
//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       // Validation - only title and price are required
//       if (!editFormData.title || !editFormData.price) {
//         throw new Error('Title and Price are required');
//       }

//       // Prepare product data for edit - matching EditProductsData schema
//       const productData = {
//         title: editFormData.title,
//         description: editFormData.description || null,
//         price: parseFloat(editFormData.price),
//         is_for_sale: editFormData.is_for_sale,
//         dimensions: editFormData.dimensions || null,
//         resolution: editFormData.resolution || null,
//         file_size_mb: editFormData.file_size_mb || null,
//         file_format: editFormData.file_format || null
//       };

//       console.log('📝 Updating product:', editingProduct.id, productData);

//       // Update product details
//       await editProduct(editingProduct.id, productData);

//       // Show success notification
//       showNotification('Product updated successfully!');

//       // Refresh products list
//       fetchProducts();

//       // Close modal after short delay
//       setTimeout(() => {
//         resetEditForm();
//         setShowEditModal(false);
//       }, 1500);

//     } catch (err) {
//       console.error('❌ Error updating product:', err);
      
//       let errorMessage = 'Failed to update product. Please try again.';
//       if (err.response?.data?.detail) {
//         if (typeof err.response.data.detail === 'string') {
//           errorMessage = err.response.data.detail;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       showNotification(errorMessage);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#171F22] text-white overflow-x-hidden">
//       {/* Admin Notification */}
//       <AdminNotification
//         message={notification.message}
//         isVisible={notification.isVisible}
//         onClose={closeNotification}
//       />

//       {/* Fixed Top Bar */}
//       <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
//         <img 
//           src="/src/assets/adminLogo.png" 
//           alt="Admin Logo" 
//           className="h-8 md:h-10"
//         />
        
//         {/* Desktop: ADMIN PAGE text */}
//         <h1 className="hidden md:block text-xl md:text-2xl font-dm-mono font-medium">
//           ADMIN PAGE
//         </h1>

//         {/* Mobile: Hamburger Menu */}
//         <button
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           className="md:hidden flex flex-col gap-1.5 w-6"
//         >
//           <span className="block w-6 h-0.5 bg-white"></span>
//           <span className="block w-6 h-0.5 bg-white"></span>
//           <span className="block w-6 h-0.5 bg-white"></span>
//         </button>
//       </div>

//       {/* Mobile Menu Overlay */}
//       {isMobileMenuOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={() => setIsMobileMenuOpen(false)}
//         >
//           <div 
//             className="absolute right-0 top-0 h-full w-64 bg-[#171F22] border-l border-gray-700 p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <nav className="space-y-6">
//               <Link 
//                 to="/admin/dashboard"
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className={`block font-dm-mono text-lg ${
//                   isActive('/admin/dashboard') ? 'font-medium' : 'font-normal'
//                 } hover:text-gray-300 transition-colors`}
//               >
//                 DASHBOARD
//               </Link>
//               <Link 
//                 to="/admin/orders"
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className={`block font-dm-mono text-lg ${
//                   isActive('/admin/orders') ? 'font-medium' : 'font-normal'
//                 } hover:text-gray-300 transition-colors`}
//               >
//                 ORDERS
//               </Link>
//               <Link 
//                 to="/admin/store"
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className={`block font-dm-mono text-lg ${
//                   isActive('/admin/store') ? 'font-medium' : 'font-normal'
//                 } hover:text-gray-300 transition-colors`}
//               >
//                 STORE
//               </Link>
//               <Link 
//                 to="/admin/portfolio"
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className={`block font-dm-mono text-lg ${
//                   isActive('/admin/portfolio') ? 'font-medium' : 'font-normal'
//                 } hover:text-gray-300 transition-colors`}
//               >
//                 PORTFOLIO
//               </Link>
//               <Link 
//                 to="/admin/pic-of-week"
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className={`block font-dm-mono text-lg ${
//                   isActive('/admin/pic-of-week') ? 'font-medium' : 'font-normal'
//                 } hover:text-gray-300 transition-colors`}
//               >
//                 P&POTW
//               </Link>
//             </nav>
//           </div>
//         </div>
//       )}

//       {/* Add Product Modal - Full page overlay */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-[#171F22] z-50 overflow-y-auto">
//           {/* Fixed Top Bar */}
//           <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
//             <img 
//               src="/src/assets/adminLogo.png" 
//               alt="Admin Logo" 
//               className="h-8 md:h-10"
//             />
//             <h1 className="hidden md:block text-xl md:text-2xl font-dm-mono font-medium">
//               ADMIN PAGE
//             </h1>
//           </div>

//           <div className="flex pt-16 md:pt-20">
//             {/* Fixed Desktop Sidebar */}
//             <aside className="hidden md:block fixed left-0 top-16 md:top-20 w-52 border-r border-gray-700 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#171F22] p-6 overflow-y-auto">
//               <nav className="space-y-6">
//                 <Link to="/admin/dashboard" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   DASHBOARD
//                 </Link>
//                 <Link to="/admin/orders" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   ORDERS
//                 </Link>
//                 <Link to="/admin/store" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
//                   STORE
//                 </Link>
//                 <Link to="/admin/portfolio" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   PORTFOLIO
//                 </Link>
//                 <Link to="/admin/pic-of-week" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   P&POTW
//                 </Link>
//               </nav>
//             </aside>

//             {/* Main Content */}
//             <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-12 bg-[#171F22] min-h-screen">
//               {/* Back Button */}
//               <button
//                 onClick={() => {
//                   resetAddForm();
//                   setShowAddModal(false);
//                 }}
//                 className="flex items-center gap-2 text-white font-dm-sans text-sm mb-4 hover:text-gray-300 transition-colors"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//                 BACK
//               </button>

//               <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
//                 STORE
//               </h2>

//               {/* Add Form */}
//               <form onSubmit={handleAddSubmit} className="space-y-4 max-w-2xl">
//                 {/* Image Upload */}
//                 <div>
//                   <label 
//                     htmlFor="image-upload"
//                     className="block w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-gray-500 cursor-pointer hover:border-gray-400 transition-colors"
//                   >
//                     {selectedImage ? (
//                       <span className="text-white">{selectedImage.name}</span>
//                     ) : (
//                       'UPLOAD PRODUCT IMAGE'
//                     )}
//                   </label>
//                   <input
//                     id="image-upload"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageSelect}
//                     className="hidden"
//                     disabled={adding}
//                   />
//                   {imagePreview && (
//                     <div className="mt-2">
//                       <img 
//                         src={imagePreview} 
//                         alt="Preview" 
//                         className="w-24 h-24 object-cover rounded"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Title */}
//                 <div>
//                   <input
//                     type="text"
//                     name="title"
//                     value={addFormData.title}
//                     onChange={handleAddInputChange}
//                     placeholder="ENTER PRODUCT TITLE"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={adding}
//                   />
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <input
//                     type="text"
//                     name="description"
//                     value={addFormData.description}
//                     onChange={handleAddInputChange}
//                     placeholder="ENTER PRODUCT DESCRIPTION"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={adding}
//                   />
//                 </div>

//                 {/* Price */}
//                 <div>
//                   <input
//                     type="number"
//                     name="price"
//                     value={addFormData.price}
//                     onChange={handleAddInputChange}
//                     placeholder="ENTER PRODUCT PRICE"
//                     step="0.01"
//                     min="0"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={adding}
//                   />
//                 </div>

//                 {/* Dimensions/Size */}
//                 <div>
//                   <input
//                     type="text"
//                     name="dimensions"
//                     value={addFormData.dimensions}
//                     onChange={handleAddInputChange}
//                     placeholder="ENTER PRODUCT DIMENSIONS/SIZE"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={adding}
//                   />
//                 </div>

//                 {/* Availability */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-2 uppercase tracking-wide">
//                     IS PRODUCT AVAILABLE?
//                   </label>
//                   <div className="flex items-center gap-6">
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={addFormData.is_for_sale === true}
//                         onChange={() => handleAddAvailabilityChange(true)}
//                         className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
//                         disabled={adding}
//                       />
//                       <span className="font-dm-sans text-sm">YES</span>
//                     </label>
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={addFormData.is_for_sale === false}
//                         onChange={() => handleAddAvailabilityChange(false)}
//                         className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
//                         disabled={adding}
//                       />
//                       <span className="font-dm-sans text-sm">NO</span>
//                     </label>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-end pt-4">
//                   <button
//                     type="submit"
//                     disabled={adding}
//                     className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {adding ? 'ADDING...' : 'ADD PRODUCT'}
//                   </button>
//                 </div>
//               </form>
//             </main>
//           </div>
//         </div>
//       )}

//       {/* Edit Product Modal - Full page overlay */}
//       {showEditModal && (
//         <div className="fixed inset-0 bg-[#171F22] z-50 overflow-y-auto">
//           {/* Fixed Top Bar */}
//           <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
//             <img 
//               src="/src/assets/adminLogo.png" 
//               alt="Admin Logo" 
//               className="h-8 md:h-10"
//             />
//             <h1 className="hidden md:block text-xl md:text-2xl font-dm-mono font-medium">
//               ADMIN PAGE
//             </h1>
//           </div>

//           <div className="flex pt-16 md:pt-20">
//             {/* Fixed Desktop Sidebar */}
//             <aside className="hidden md:block fixed left-0 top-16 md:top-20 w-52 border-r border-gray-700 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#171F22] p-6 overflow-y-auto">
//               <nav className="space-y-6">
//                 <Link to="/admin/dashboard" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   DASHBOARD
//                 </Link>
//                 <Link to="/admin/orders" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   ORDERS
//                 </Link>
//                 <Link to="/admin/store" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
//                   STORE
//                 </Link>
//                 <Link to="/admin/portfolio" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   PORTFOLIO
//                 </Link>
//                 <Link to="/admin/pic-of-week" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   P&POTW
//                 </Link>
//               </nav>
//             </aside>

//             {/* Main Content */}
//             <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-12 bg-[#171F22] min-h-screen">
//               {/* Back Button */}
//               <button
//                 onClick={() => {
//                   resetEditForm();
//                   setShowEditModal(false);
//                 }}
//                 className="flex items-center gap-2 text-white font-dm-sans text-sm mb-4 hover:text-gray-300 transition-colors"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//                 BACK
//               </button>

//               <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
//                 EDIT PRODUCT
//               </h2>

//               {/* Edit Form */}
//               <form onSubmit={handleEditSubmit} className="space-y-4 max-w-2xl">
//                 {/* Title */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
//                     TITLE
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={editFormData.title}
//                     onChange={handleEditInputChange}
//                     placeholder="ENTER TITLE"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
//                     DESCRIPTION
//                   </label>
//                   <input
//                     type="text"
//                     name="description"
//                     value={editFormData.description}
//                     onChange={handleEditInputChange}
//                     placeholder="ENTER DESCRIPTION"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Price */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
//                     PRICE
//                   </label>
//                   <input
//                     type="number"
//                     name="price"
//                     value={editFormData.price}
//                     onChange={handleEditInputChange}
//                     placeholder="ENTER PRICE"
//                     step="0.01"
//                     min="0"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Availability */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-2 uppercase tracking-wide">
//                     AVAILABILITY
//                   </label>
//                   <div className="flex items-center gap-6">
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={editFormData.is_for_sale === true}
//                         onChange={() => handleAvailabilityChange(true)}
//                         className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
//                         disabled={submitting}
//                       />
//                       <span className="font-dm-sans text-sm">YES</span>
//                     </label>
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={editFormData.is_for_sale === false}
//                         onChange={() => handleAvailabilityChange(false)}
//                         className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
//                         disabled={submitting}
//                       />
//                       <span className="font-dm-sans text-sm">NO</span>
//                     </label>
//                   </div>
//                 </div>

//                 {/* Dimensions (Optional) */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
//                     DIMENSION
//                   </label>
//                   <input
//                     type="text"
//                     name="dimensions"
//                     value={editFormData.dimensions}
//                     onChange={handleEditInputChange}
//                     placeholder="ENTER DIMENSION"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Resolution (Optional) */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
//                     RESOLUTION
//                   </label>
//                   <input
//                     type="text"
//                     name="resolution"
//                     value={editFormData.resolution}
//                     onChange={handleEditInputChange}
//                     placeholder="ENTER RESOLUTION"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* File Size (Optional) */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
//                     FILE SIZE(MB)
//                   </label>
//                   <input
//                     type="text"
//                     name="file_size_mb"
//                     value={editFormData.file_size_mb}
//                     onChange={handleEditInputChange}
//                     placeholder="ENTER FILE SIZE"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* File Format (Optional) */}
//                 <div>
//                   <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
//                     FILE FORMAT
//                   </label>
//                   <input
//                     type="text"
//                     name="file_format"
//                     value={editFormData.file_format}
//                     onChange={handleEditInputChange}
//                     placeholder="ENTER FILE FORMAT"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={submitting}
//                   />
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-4 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       resetEditForm();
//                       setShowEditModal(false);
//                     }}
//                     className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
//                     disabled={submitting}
//                   >
//                     CANCEL
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {submitting ? 'SAVING...' : 'SAVE'}
//                   </button>
//                 </div>
//               </form>
//             </main>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && deletingProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-[#171F22] border border-gray-700 p-6 md:p-8 max-w-md w-full">
//             <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-4">
//               DELETE PRODUCT
//             </h3>
//             <p className="font-dm-sans text-gray-300 mb-6">
//               Are you sure you want to delete "<span className="text-white font-medium">{deletingProduct.title}</span>"? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={cancelDelete}
//                 className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
//                 disabled={deleting}
//               >
//                 CANCEL
//               </button>
//               <button
//                 type="button"
//                 onClick={confirmDeleteProduct}
//                 disabled={deleting}
//                 className="bg-red-600 border border-red-600 text-white font-dm-sans px-6 py-2 hover:bg-red-700 hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {deleting ? 'DELETING...' : 'DELETE'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex pt-16 md:pt-20">
//         {/* Fixed Desktop Sidebar */}
//         <aside className="hidden md:block fixed left-0 top-16 md:top-20 w-52 border-r border-gray-700 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#171F22] p-6 overflow-y-auto">
//           <nav className="space-y-6">
//             <Link 
//               to="/admin/dashboard"
//               className={`block font-dm-mono text-lg ${
//                 isActive('/admin/dashboard') ? 'font-medium' : 'font-normal'
//               } hover:text-gray-300 transition-colors`}
//             >
//               DASHBOARD
//             </Link>
//             <Link 
//               to="/admin/orders"
//               className={`block font-dm-mono text-lg ${
//                 isActive('/admin/orders') ? 'font-medium' : 'font-normal'
//               } hover:text-gray-300 transition-colors`}
//             >
//               ORDERS
//             </Link>
//             <Link 
//               to="/admin/store"
//               className={`block font-dm-mono text-lg ${
//                 isActive('/admin/store') ? 'font-medium' : 'font-normal'
//               } hover:text-gray-300 transition-colors`}
//             >
//               STORE
//             </Link>
//             <Link 
//               to="/admin/portfolio"
//               className={`block font-dm-mono text-lg ${
//                 isActive('/admin/portfolio') ? 'font-medium' : 'font-normal'
//               } hover:text-gray-300 transition-colors`}
//             >
//               PORTFOLIO
//             </Link>
//             <Link 
//               to="/admin/pic-of-week"
//               className={`block font-dm-mono text-lg ${
//                 isActive('/admin/pic-of-week') ? 'font-medium' : 'font-normal'
//               } hover:text-gray-300 transition-colors`}
//             >
//               P&POTW
//             </Link>
//           </nav>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-12 bg-[#171F22] min-h-screen overflow-x-hidden">
//           {/* Header with Title and Add Button */}
//           <div className="flex items-center justify-between mb-8 md:mb-12">
//             <h2 className="text-2xl md:text-3xl lg:text-4xl font-dm-sans font-medium">
//               STORE
//             </h2>
//             <button
//               onClick={handleAddProduct}
//               className="flex items-center gap-2 bg-transparent border border-white text-white font-dm-sans text-sm px-4 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
//             >
//               <span className="text-lg">+</span>
//               ADD PRODUCT
//             </button>
//           </div>

//           {/* Loading State - Skeleton Loaders */}
//           {loading ? (
//             <>
//               {/* Stats Grid Skeleton */}
//               <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-16">
//                 {[...Array(3)].map((_, index) => (
//                   <div key={index} className="animate-pulse">
//                     <div className="h-12 md:h-16 bg-gray-700 rounded w-16 md:w-32 mb-2"></div>
//                     <div className="h-3 md:h-4 bg-gray-700 rounded w-16 md:w-24"></div>
//                   </div>
//                 ))}
//               </div>

//               {/* Section Title Skeleton */}
//               <div className="h-6 md:h-8 bg-gray-700 rounded w-40 mb-6 animate-pulse"></div>

//               {/* Products Grid Skeleton */}
//               <div className="space-y-4">
//                 {[...Array(5)].map((_, index) => (
//                   <div key={index} className="flex items-center gap-4 border-b border-gray-700 pb-4 animate-pulse">
//                     <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700 rounded"></div>
//                     <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
//                       <div className="h-4 bg-gray-700 rounded w-12"></div>
//                       <div className="h-4 bg-gray-700 rounded w-32"></div>
//                       <div className="h-4 bg-gray-700 rounded w-16"></div>
//                       <div className="h-4 bg-gray-700 rounded w-24"></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <>
//               {/* Stats Grid - 3 stats */}
//               <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-16">
//                 {/* Total Products */}
//                 <div>
//                   <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
//                     {stats.totalProducts}
//                   </p>
//                   <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
//                     TOTAL PRODUCTS
//                   </p>
//                 </div>

//                 {/* Available Products */}
//                 <div>
//                   <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
//                     {stats.availableProducts}
//                   </p>
//                   <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
//                     AVAILABLE PRODUCTS
//                   </p>
//                 </div>

//                 {/* Unavailable Products */}
//                 <div>
//                   <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
//                     {stats.unavailableProducts}
//                   </p>
//                   <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
//                     UNAVAILABLE PRODUCTS
//                   </p>
//                 </div>
//               </div>

//               {/* Total Products Section Title */}
//               <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-6">
//                 TOTAL PRODUCTS
//               </h3>

//               {/* Products List */}
//               {productsToDisplay.length === 0 ? (
//                 <p className="text-gray-400 font-dm-sans text-sm md:text-base">No products yet.</p>
//               ) : (
//                 <div className="overflow-x-auto -mx-4 md:mx-0">
//                   <div className="min-w-[900px] px-4 md:px-0">
//                     {/* Table Header */}
//                     <div className="hidden md:grid md:grid-cols-[100px_1fr_2fr_1fr_1.5fr_100px] gap-6 pb-4 border-b border-gray-700 mb-4">
//                       <div></div> {/* Image column */}
//                       <p className="font-dm-sans text-sm font-medium">ID</p>
//                       <p className="font-dm-sans text-sm font-medium">TITLE</p>
//                       <p className="font-dm-sans text-sm font-medium">PRICE</p>
//                       <p className="font-dm-sans text-sm font-medium">AVAILABILITY</p>
//                       <div></div> {/* Actions column */}
//                     </div>

//                     {/* Products */}
//                     <div className="space-y-0">
//                       {productsToDisplay.map((product, index) => (
//                         <div 
//                           key={product.id}
//                           className={`grid grid-cols-[80px_1fr_2fr_1fr_1.5fr_100px] md:grid-cols-[100px_1fr_2fr_1fr_1.5fr_100px] gap-4 md:gap-6 items-center py-4 ${
//                             index !== productsToDisplay.length - 1 ? 'border-b border-gray-700' : ''
//                           }`}
//                         >
//                           {/* Product Image */}
//                           <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden flex-shrink-0 bg-gray-700">
//                             <img 
//                               src={product.image_url} 
//                               alt={product.title}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>

//                           {/* Product ID */}
//                           <p className="font-dm-sans text-xs md:text-sm">
//                             {product.id}
//                           </p>

//                           {/* Title */}
//                           <p className="font-dm-sans text-xs md:text-sm">
//                             {product.title}
//                           </p>

//                           {/* Price */}
//                           <p className="font-dm-sans text-xs md:text-sm">
//                             £{product.price}
//                           </p>

//                           {/* Availability */}
//                           <p className="font-dm-sans text-xs md:text-sm capitalize">
//                             {product.is_for_sale ? 'Available' : 'Unavailable'}
//                           </p>

//                           {/* Action Icons */}
//                           <div className="flex items-center justify-end gap-3 md:gap-4">
//                             {/* Edit Icon */}
//                             <button
//                               onClick={() => handleEditProduct(product.id)}
//                               className="hover:text-gray-400 transition-colors"
//                             >
//                               <svg 
//                                 className="w-4 h-4 md:w-5 md:h-5" 
//                                 fill="none" 
//                                 stroke="currentColor" 
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path 
//                                   strokeLinecap="round" 
//                                   strokeLinejoin="round" 
//                                   strokeWidth={2} 
//                                   d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
//                                 />
//                               </svg>
//                             </button>

//                             {/* Delete Icon */}
//                             <button
//                               onClick={() => handleDeleteProduct(product.id)}
//                               className="hover:text-red-500 transition-colors"
//                             >
//                               <svg 
//                                 className="w-4 h-4 md:w-5 md:h-5" 
//                                 fill="none" 
//                                 stroke="currentColor" 
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path 
//                                   strokeLinecap="round" 
//                                   strokeLinejoin="round" 
//                                   strokeWidth={2} 
//                                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
//                                 />
//                               </svg>
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default AdminStore;

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAdminProductStore from '../../stores/useAdminProductStore';
import AdminNotification from '../../components/AdminNotification';

function AdminStore() {
  const location = useLocation();
  
  // Zustand store
  const { products, fetchProducts, loading, editProduct, addProductMetafield, deleteProduct, addProductByFile } = useAdminProductStore();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: '',
    description: '',
    price: '',
    dimensions: '',
    resolution: '',
    file_size_mb: '',
    file_format: '',
    is_for_sale: true
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit form state - using correct backend field names
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    is_for_sale: true,
    dimensions: '',
    resolution: '',
    file_size_mb: '',
    file_format: ''
  });

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    unavailableProducts: 0
  });

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

  // Fetch data on mount
  useEffect(() => {
    console.log('📊 Fetching products data...');
    fetchProducts();
  }, [fetchProducts]);

  // Log fetched data for debugging
  useEffect(() => {
    console.log('📦 Products received:', products);
  }, [products]);

  // Calculate stats from real data
  useEffect(() => {
    console.log('🔢 Calculating stats...');
    
    const totalProducts = products.length;
    
    const availableProducts = products.filter(product => 
      product.is_for_sale === true
    ).length;

    const unavailableProducts = products.filter(product => 
      product.is_for_sale === false
    ).length;

    const calculatedStats = {
      totalProducts,
      availableProducts,
      unavailableProducts
    };

    console.log('📊 Calculated Stats:', calculatedStats);
    setStats(calculatedStats);
  }, [products]);

  const isActive = (path) => location.pathname === path;

  // Get all products (reversed to show newest first)
  const productsToDisplay = [...products].reverse();

  console.log('📋 Products to display:', productsToDisplay);

  // Handle add product modal open
  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  // Handle add form input changes
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add form availability change
  const handleAddAvailabilityChange = (value) => {
    setAddFormData(prev => ({
      ...prev,
      is_for_sale: value
    }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setAddFormData({
      title: '',
      description: '',
      price: '',
      dimensions: '',
      resolution: '',
      file_size_mb: '',
      file_format: '',
      is_for_sale: true
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle add form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      // Validation
      if (!selectedImage) {
        throw new Error('Please select an image');
      }
      if (!addFormData.title) {
        throw new Error('Please enter a product title');
      }
      if (!addFormData.price) {
        throw new Error('Please enter a product price');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image_file', selectedImage);
      formData.append('title', addFormData.title);
      formData.append('description', addFormData.description || '');
      formData.append('price', parseFloat(addFormData.price));
      formData.append('is_for_sale', addFormData.is_for_sale);
      if (addFormData.dimensions) {
        formData.append('dimensions', addFormData.dimensions);
      }

      console.log('📤 Adding product...');
      const newProduct = await addProductByFile(formData);

      // If metafields are provided, add them via separate endpoint
      const hasMetafields = addFormData.resolution || addFormData.file_size_mb || addFormData.file_format;
      if (hasMetafields && newProduct?.id) {
        const metafieldData = {
          dimensions: addFormData.dimensions || null,
          resolution: addFormData.resolution || null,
          file_size_mb: addFormData.file_size_mb || null,
          file_format: addFormData.file_format || null
        };
        console.log('📝 Adding metafields...');
        await addProductMetafield(newProduct.id, metafieldData);
      }

      // Show success notification
      showNotification('Product added successfully!');

      // Refresh products list
      fetchProducts();

      // Close modal after short delay
      setTimeout(() => {
        resetAddForm();
        setShowAddModal(false);
      }, 1500);

    } catch (err) {
      console.error('❌ Error adding product:', err);
      
      let errorMessage = 'Failed to add product. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  const handleEditProduct = (productId) => {
    // Find the product to edit
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setEditFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        is_for_sale: product.is_for_sale !== false,
        dimensions: product.dimensions || '',
        resolution: product.resolution || '',
        file_size_mb: product.file_size_mb || '',
        file_format: product.file_format || ''
      });
      setShowEditModal(true);
    }
  };

  const handleDeleteProduct = (productId) => {
    // Find the product to delete
    const product = products.find(p => p.id === productId);
    if (product) {
      setDeletingProduct(product);
      setShowDeleteModal(true);
    }
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    setDeleting(true);
    try {
      console.log('🗑️ Deleting product:', deletingProduct.id);
      await deleteProduct(deletingProduct.id);
      
      // Show success notification
      showNotification(`"${deletingProduct.title}" deleted successfully!`);
      
      // Refresh products list
      fetchProducts();
      
      // Close modal
      setShowDeleteModal(false);
      setDeletingProduct(null);
      
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      
      let errorMessage = 'Failed to delete product. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle availability change
  const handleAvailabilityChange = (value) => {
    setEditFormData(prev => ({
      ...prev,
      is_for_sale: value
    }));
  };

  // Reset edit form
  const resetEditForm = () => {
    setEditFormData({
      title: '',
      description: '',
      price: '',
      is_for_sale: true,
      dimensions: '',
      resolution: '',
      file_size_mb: '',
      file_format: ''
    });
    setEditingProduct(null);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation - only title and price are required
      if (!editFormData.title || !editFormData.price) {
        throw new Error('Title and Price are required');
      }

      // Prepare product data for edit - matching EditProductsData schema
      const productData = {
        title: editFormData.title,
        description: editFormData.description || null,
        price: parseFloat(editFormData.price),
        is_for_sale: editFormData.is_for_sale,
        dimensions: editFormData.dimensions || null,
        resolution: editFormData.resolution || null,
        file_size_mb: editFormData.file_size_mb || null,
        file_format: editFormData.file_format || null
      };

      console.log('📝 Updating product:', editingProduct.id, productData);

      // Update product details
      await editProduct(editingProduct.id, productData);

      // Show success notification
      showNotification('Product updated successfully!');

      // Refresh products list
      fetchProducts();

      // Close modal after short delay
      setTimeout(() => {
        resetEditForm();
        setShowEditModal(false);
      }, 1500);

    } catch (err) {
      console.error('❌ Error updating product:', err);
      
      let errorMessage = 'Failed to update product. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Add Product Modal - Full page overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#171F22] z-50 overflow-y-auto">
          {/* Fixed Top Bar */}
          <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
            <img 
              src="/src/assets/adminLogo.png" 
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
                <Link to="/admin/orders" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  ORDERS
                </Link>
                <Link to="/admin/store" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
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
                  resetAddForm();
                  setShowAddModal(false);
                }}
                className="flex items-center gap-2 text-white font-dm-sans text-sm mb-4 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                BACK
              </button>

              <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
                STORE
              </h2>

              {/* Add Form */}
              <form onSubmit={handleAddSubmit} className="space-y-4 max-w-5xl">
                {/* Image Upload */}
                <div>
                  <label 
                    htmlFor="image-upload"
                    className="block w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-gray-500 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {selectedImage ? (
                      <span className="text-white">{selectedImage.name}</span>
                    ) : (
                      'UPLOAD PRODUCT IMAGE'
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={adding}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <input
                    type="text"
                    name="title"
                    value={addFormData.title}
                    onChange={handleAddInputChange}
                    placeholder="ENTER PRODUCT TITLE"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* Description */}
                <div>
                  <input
                    type="text"
                    name="description"
                    value={addFormData.description}
                    onChange={handleAddInputChange}
                    placeholder="ENTER PRODUCT DESCRIPTION"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* Price */}
                <div>
                  <input
                    type="number"
                    name="price"
                    value={addFormData.price}
                    onChange={handleAddInputChange}
                    placeholder="ENTER PRODUCT PRICE"
                    step="0.01"
                    min="0"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* Dimensions/Size */}
                <div>
                  <input
                    type="text"
                    name="dimensions"
                    value={addFormData.dimensions}
                    onChange={handleAddInputChange}
                    placeholder="ENTER PRODUCT DIMENSIONS/SIZE"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* Resolution (Optional) */}
                <div>
                  <input
                    type="text"
                    name="resolution"
                    value={addFormData.resolution}
                    onChange={handleAddInputChange}
                    placeholder="ENTER PRODUCT RESOLUTION"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* File Size MB (Optional) */}
                <div>
                  <input
                    type="text"
                    name="file_size_mb"
                    value={addFormData.file_size_mb}
                    onChange={handleAddInputChange}
                    placeholder="ENTER FILE SIZE (MB)"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* File Format (Optional) */}
                <div>
                  <input
                    type="text"
                    name="file_format"
                    value={addFormData.file_format}
                    onChange={handleAddInputChange}
                    placeholder="ENTER FILE FORMAT"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-2 uppercase tracking-wide">
                    IS PRODUCT AVAILABLE?
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addFormData.is_for_sale === true}
                        onChange={() => handleAddAvailabilityChange(true)}
                        className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
                        disabled={adding}
                      />
                      <span className="font-dm-sans text-sm">YES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addFormData.is_for_sale === false}
                        onChange={() => handleAddAvailabilityChange(false)}
                        className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
                        disabled={adding}
                      />
                      <span className="font-dm-sans text-sm">NO</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={adding}
                    className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adding ? 'ADDING...' : 'ADD PRODUCT'}
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {/* Edit Product Modal - Full page overlay */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#171F22] z-50 overflow-y-auto">
          {/* Fixed Top Bar */}
          <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
            <img 
              src="/src/assets/adminLogo.png" 
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
                <Link to="/admin/orders" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  ORDERS
                </Link>
                <Link to="/admin/store" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
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
                  resetEditForm();
                  setShowEditModal(false);
                }}
                className="flex items-center gap-2 text-white font-dm-sans text-sm mb-4 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                BACK
              </button>

              <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
                EDIT PRODUCT
              </h2>

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="space-y-4 max-w-5xl">
                {/* Title */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    TITLE
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    placeholder="ENTER TITLE"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    DESCRIPTION
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="ENTER DESCRIPTION"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    PRICE
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditInputChange}
                    placeholder="ENTER PRICE"
                    step="0.01"
                    min="0"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-2 uppercase tracking-wide">
                    AVAILABILITY
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.is_for_sale === true}
                        onChange={() => handleAvailabilityChange(true)}
                        className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
                        disabled={submitting}
                      />
                      <span className="font-dm-sans text-sm">YES</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.is_for_sale === false}
                        onChange={() => handleAvailabilityChange(false)}
                        className="w-4 h-4 bg-transparent border border-white appearance-none checked:bg-white checked:border-white cursor-pointer"
                        disabled={submitting}
                      />
                      <span className="font-dm-sans text-sm">NO</span>
                    </label>
                  </div>
                </div>

                {/* Dimensions (Optional) */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    DIMENSION
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    value={editFormData.dimensions}
                    onChange={handleEditInputChange}
                    placeholder="ENTER DIMENSION"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </div>

                {/* Resolution (Optional) */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    RESOLUTION
                  </label>
                  <input
                    type="text"
                    name="resolution"
                    value={editFormData.resolution}
                    onChange={handleEditInputChange}
                    placeholder="ENTER RESOLUTION"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </div>

                {/* File Size (Optional) */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    FILE SIZE(MB)
                  </label>
                  <input
                    type="text"
                    name="file_size_mb"
                    value={editFormData.file_size_mb}
                    onChange={handleEditInputChange}
                    placeholder="ENTER FILE SIZE"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </div>

                {/* File Format (Optional) */}
                <div>
                  <label className="block font-dm-sans text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    FILE FORMAT
                  </label>
                  <input
                    type="text"
                    name="file_format"
                    value={editFormData.file_format}
                    onChange={handleEditInputChange}
                    placeholder="ENTER FILE FORMAT"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={submitting}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetEditForm();
                      setShowEditModal(false);
                    }}
                    className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
                    disabled={submitting}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#171F22] border border-gray-700 p-6 md:p-8 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-4">
              DELETE PRODUCT
            </h3>
            <p className="font-dm-sans text-gray-300 mb-6">
              Are you sure you want to delete "<span className="text-white font-medium">{deletingProduct.title}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={cancelDelete}
                className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors"
                disabled={deleting}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={deleting}
                className="bg-red-600 border border-red-600 text-white font-dm-sans px-6 py-2 hover:bg-red-700 hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
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
          {/* Header with Title and Add Button */}
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-dm-sans font-medium">
              STORE
            </h2>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 bg-transparent border border-white text-white font-dm-sans text-sm px-4 py-1 hover:bg-white hover:text-[#171F22] transition-colors"
            >
              <span className="text-lg">+</span>
              ADD PRODUCT
            </button>
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

              {/* Section Title Skeleton */}
              <div className="h-6 md:h-8 bg-gray-700 rounded w-40 mb-6 animate-pulse"></div>

              {/* Products Grid Skeleton */}
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4 border-b border-gray-700 pb-4 animate-pulse">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700 rounded"></div>
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="h-4 bg-gray-700 rounded w-12"></div>
                      <div className="h-4 bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-700 rounded w-16"></div>
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Stats Grid - 3 stats */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-16">
                {/* Total Products */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.totalProducts}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    TOTAL PRODUCTS
                  </p>
                </div>

                {/* Available Products */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.availableProducts}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    AVAILABLE PRODUCTS
                  </p>
                </div>

                {/* Unavailable Products */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.unavailableProducts}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    UNAVAILABLE PRODUCTS
                  </p>
                </div>
              </div>

              {/* Total Products Section Title */}
              <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-6">
                TOTAL PRODUCTS
              </h3>

              {/* Products List */}
              {productsToDisplay.length === 0 ? (
                <p className="text-gray-400 font-dm-sans text-sm md:text-base">No products yet.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="min-w-[900px] px-4 md:px-0">
                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-[100px_1fr_2fr_1fr_1.5fr_100px] gap-6 pb-4 border-b border-gray-700 mb-4">
                      <div></div> {/* Image column */}
                      <p className="font-dm-sans text-sm font-medium">ID</p>
                      <p className="font-dm-sans text-sm font-medium">TITLE</p>
                      <p className="font-dm-sans text-sm font-medium">PRICE</p>
                      <p className="font-dm-sans text-sm font-medium">AVAILABILITY</p>
                      <div></div> {/* Actions column */}
                    </div>

                    {/* Products */}
                    <div className="space-y-0">
                      {productsToDisplay.map((product, index) => (
                        <div 
                          key={product.id}
                          className={`grid grid-cols-[80px_1fr_2fr_1fr_1.5fr_100px] md:grid-cols-[100px_1fr_2fr_1fr_1.5fr_100px] gap-4 md:gap-6 items-center py-4 ${
                            index !== productsToDisplay.length - 1 ? 'border-b border-gray-700' : ''
                          }`}
                        >
                          {/* Product Image */}
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden flex-shrink-0 bg-gray-700">
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product ID */}
                          <p className="font-dm-sans text-xs md:text-sm">
                            {product.id}
                          </p>

                          {/* Title */}
                          <p className="font-dm-sans text-xs md:text-sm">
                            {product.title}
                          </p>

                          {/* Price */}
                          <p className="font-dm-sans text-xs md:text-sm">
                            £{product.price}
                          </p>

                          {/* Availability */}
                          <p className="font-dm-sans text-xs md:text-sm capitalize">
                            {product.is_for_sale ? 'Available' : 'Unavailable'}
                          </p>

                          {/* Action Icons */}
                          <div className="flex items-center justify-end gap-3 md:gap-4">
                            {/* Edit Icon */}
                            <button
                              onClick={() => handleEditProduct(product.id)}
                              className="hover:text-gray-400 transition-colors"
                            >
                              <svg 
                                className="w-4 h-4 md:w-5 md:h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                                />
                              </svg>
                            </button>

                            {/* Delete Icon */}
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <svg 
                                className="w-4 h-4 md:w-5 md:h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminStore;