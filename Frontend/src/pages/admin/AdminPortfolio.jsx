// import { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import useAdminPortfolioStore from '../../stores/useAdminPortfolioStore';
// import AdminNotification from '../../components/AdminNotification';
// import Select from 'react-select';
// import adminLogo from '../../assets/adminLogo.png';


// function AdminPortfolio() {
//   const location = useLocation();
  
//   // Zustand store
//   const { portfolios, fetchPortfolios, loading, addPortfolio, deletePortfolio } = useAdminPortfolioStore();

//   // Mobile menu state
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Active category filter
//   const [activeCategory, setActiveCategory] = useState('digital');

//   // Add work modal state
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [adding, setAdding] = useState(false);
//   const [addFormData, setAddFormData] = useState({
//     title: '',
//     category: null
//   });
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);

//   // Delete modal state
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deletingPortfolio, setDeletingPortfolio] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   // Notification state
//   const [notification, setNotification] = useState({
//     isVisible: false,
//     message: ''
//   });

//   // Category options for dropdown
//   const categoryOptions = [
//     { value: 'digital', label: 'Digital' },
//     { value: 'nature', label: 'Nature' },
//     { value: 'wildlife', label: 'Wildlife' },
//     { value: 'landscape', label: 'Landscape' }
//   ];

//   // Custom styles for react-select (dark theme)
//   const selectStyles = {
//     control: (base, state) => ({
//       ...base,
//       backgroundColor: 'transparent',
//       borderColor: 'white',
//       borderRadius: 0,
//       padding: '6px 4px',
//       boxShadow: state.isFocused ? '0 0 0 1px white' : 'none',
//       '&:hover': {
//         borderColor: 'white'
//       }
//     }),
//     menu: (base) => ({
//       ...base,
//       backgroundColor: '#171F22',
//       border: '1px solid white',
//       borderRadius: 0
//     }),
//     option: (base, state) => ({
//       ...base,
//       backgroundColor: state.isSelected ? '#374151' : state.isFocused ? '#1f2937' : 'transparent',
//       color: 'white',
//       '&:hover': {
//         backgroundColor: '#1f2937'
//       }
//     }),
//     singleValue: (base) => ({
//       ...base,
//       color: 'white'
//     }),
//     placeholder: (base) => ({
//       ...base,
//       color: '#6b7280'
//     }),
//     input: (base) => ({
//       ...base,
//       color: 'white'
//     }),
//     indicatorSeparator: () => ({
//       display: 'none'
//     }),
//     dropdownIndicator: (base) => ({
//       ...base,
//       color: 'white',
//       '&:hover': {
//         color: 'white'
//       }
//     })
//   };

//   // Stats calculation
//   const stats = {
//     digital: portfolios.filter(p => p.category?.toLowerCase() === 'digital').length,
//     nature: portfolios.filter(p => p.category?.toLowerCase() === 'nature').length,
//     wildlife: portfolios.filter(p => p.category?.toLowerCase() === 'wildlife').length,
//     landscape: portfolios.filter(p => p.category?.toLowerCase() === 'landscape').length
//   };

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
//     fetchPortfolios();
//   }, [fetchPortfolios]);

//   const isActive = (path) => location.pathname === path;

//   // Filter portfolios by active category
//   const filteredPortfolios = portfolios.filter(
//     p => p.category?.toLowerCase() === activeCategory.toLowerCase()
//   );

//   // Get first image URL from portfolio
//   const getFirstImageUrl = (portfolio) => {
//     if (!portfolio.images || portfolio.images.length === 0) return null;
//     const firstImage = portfolio.images[0];
//     if (typeof firstImage === 'string') return firstImage;
//     return firstImage.image_url || firstImage.url || null;
//   };

//   // Handle add work modal
//   const handleAddWork = () => {
//     setShowAddModal(true);
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setAddFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle category change
//   const handleCategoryChange = (selectedOption) => {
//     setAddFormData(prev => ({
//       ...prev,
//       category: selectedOption
//     }));
//   };

//   // Handle multiple image selection - APPEND to existing selection
//   const handleImageSelect = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 0) {
//       // Append new files to existing selection
//       setSelectedImages(prev => [...prev, ...files]);
//       // Create preview URLs for new files and append to existing previews
//       const newPreviews = files.map(file => URL.createObjectURL(file));
//       setImagePreviews(prev => [...prev, ...newPreviews]);
//     }
//     // Reset the input so the same file can be selected again if needed
//     e.target.value = '';
//   };

//   // Remove a selected image by index
//   const handleRemoveImage = (indexToRemove) => {
//     // Revoke the preview URL to free memory
//     URL.revokeObjectURL(imagePreviews[indexToRemove]);
//     // Remove from both arrays
//     setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
//     setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
//   };

//   // Reset add form
//   const resetAddForm = () => {
//     setAddFormData({
//       title: '',
//       category: null
//     });
//     setSelectedImages([]);
//     // Revoke preview URLs to free memory
//     imagePreviews.forEach(url => URL.revokeObjectURL(url));
//     setImagePreviews([]);
//   };

//   // Handle add form submission
//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     setAdding(true);

//     try {
//       // Validation
//       if (selectedImages.length === 0) {
//         throw new Error('Please select at least one image');
//       }
//       if (!addFormData.title) {
//         throw new Error('Please enter a title');
//       }
//       if (!addFormData.category) {
//         throw new Error('Please select a category');
//       }

//       // Create FormData for file upload
//       const formData = new FormData();
//       formData.append('title', addFormData.title);
//       formData.append('category', addFormData.category.value);
      
//       // Append all selected images
//       selectedImages.forEach(file => {
//         formData.append('files', file);
//       });

//       console.log('📤 Adding portfolio...');
//       await addPortfolio(formData);

//       // Show success notification
//       showNotification('Portfolio added successfully!');

//       // Refresh portfolios list
//       fetchPortfolios();

//       // Close modal after short delay
//       setTimeout(() => {
//         resetAddForm();
//         setShowAddModal(false);
//       }, 1500);

//     } catch (err) {
//       console.error('❌ Error adding portfolio:', err);
      
//       let errorMessage = 'Failed to add portfolio. Please try again.';
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

//   // Handle delete portfolio
//   const handleDeletePortfolio = (portfolio) => {
//     setDeletingPortfolio(portfolio);
//     setShowDeleteModal(true);
//   };

//   // Confirm delete
//   const confirmDeletePortfolio = async () => {
//     if (!deletingPortfolio) return;
    
//     setDeleting(true);
//     try {
//       console.log('🗑️ Deleting portfolio:', deletingPortfolio.id);
//       await deletePortfolio(deletingPortfolio.id);
      
//       // Show success notification
//       showNotification(`"${deletingPortfolio.title}" deleted successfully!`);
      
//       // Refresh portfolios list
//       fetchPortfolios();
      
//       // Close modal
//       setShowDeleteModal(false);
//       setDeletingPortfolio(null);
      
//     } catch (err) {
//       console.error('❌ Error deleting portfolio:', err);
      
//       let errorMessage = 'Failed to delete portfolio. Please try again.';
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
//     setDeletingPortfolio(null);
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
//           src={adminLogo} 
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

//       {/* Add Work Modal - Full page overlay */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-[#171F22] z-50 overflow-y-auto">
//           {/* Fixed Top Bar */}
//           <div className="fixed top-0 left-0 right-0 z-30 border-b border-gray-700 bg-[#171F22] px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
//             <img 
//               src={adminLogo} 
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
//                 <Link to="/admin/store" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
//                   STORE
//                 </Link>
//                 <Link to="/admin/portfolio" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
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
//                 PORTFOLIO
//               </h2>

//               {/* Add Form */}
//               <form onSubmit={handleAddSubmit} className="space-y-4 max-w-5xl p-6">
//                 {/* Image Upload */}
//                 <div>
//                   <label 
//                     htmlFor="portfolio-image-upload"
//                     className="block w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-gray-500 cursor-pointer hover:border-gray-400 transition-colors"
//                   >
//                     {selectedImages.length > 0 ? (
//                       <span className="text-white">{selectedImages.length} image(s) selected</span>
//                     ) : (
//                       'UPLOAD IMAGE/IMAGES'
//                     )}
//                   </label>
//                   <input
//                     id="portfolio-image-upload"
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     onChange={handleImageSelect}
//                     className="hidden"
//                     disabled={adding}
//                   />
//                   {imagePreviews.length > 0 && (
//                     <div className="mt-4 flex flex-wrap gap-3">
//                       {imagePreviews.map((preview, index) => (
//                         <div key={index} className="relative">
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveImage(index)}
//                             className="absolute -top-2 -left-2 w-5 h-5 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors z-10"
//                             disabled={adding}
//                           >
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                           </button>
//                           <img 
//                             src={preview} 
//                             alt={`Preview ${index + 1}`} 
//                             className="w-20 h-20 object-cover"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Title */}
//                 <div>
//                   <input
//                     type="text"
//                     name="title"
//                     value={addFormData.title}
//                     onChange={handleInputChange}
//                     placeholder="ENTER TITLE"
//                     className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
//                     disabled={adding}
//                   />
//                 </div>

//                 {/* Category Dropdown */}
//                 <div>
//                   <Select
//                     value={addFormData.category}
//                     onChange={handleCategoryChange}
//                     options={categoryOptions}
//                     placeholder="ENTER CATEGORY"
//                     styles={selectStyles}
//                     isDisabled={adding}
//                   />
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-end pt-4">
//                   <button
//                     type="submit"
//                     disabled={adding}
//                     className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {adding ? 'ADDING...' : 'ADD WORK'}
//                   </button>
//                 </div>
//               </form>
//             </main>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && deletingPortfolio && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-[#171F22] border border-gray-700 p-6 md:p-8 max-w-md w-full">
//             <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-4">
//               DELETE PORTFOLIO
//             </h3>
//             <p className="font-dm-sans text-gray-300 mb-6">
//               Are you sure you want to delete "<span className="text-white font-medium">{deletingPortfolio.title}</span>"? This action cannot be undone.
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
//                 onClick={confirmDeletePortfolio}
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
//               PORTFOLIO
//             </h2>
//             <button
//               onClick={handleAddWork}
//               className="flex items-center gap-2 bg-transparent border border-white text-white font-dm-sans text-sm px-4 py-1 hover:bg-white hover:text-[#171F22] transition-colors"
//             >
//               <span className="text-lg">+</span>
//               ADD WORK
//             </button>
//           </div>

//           {/* Loading State */}
//           {loading ? (
//             <>
//               {/* Stats Grid Skeleton */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-12">
//                 {[...Array(4)].map((_, index) => (
//                   <div key={index} className="animate-pulse">
//                     <div className="h-12 md:h-16 bg-gray-700 rounded w-16 md:w-20 mb-2"></div>
//                     <div className="h-3 md:h-4 bg-gray-700 rounded w-16 md:w-20"></div>
//                   </div>
//                 ))}
//               </div>

//               {/* Category Tabs Skeleton */}
//               <div className="flex gap-6 mb-8 animate-pulse">
//                 {[...Array(4)].map((_, index) => (
//                   <div key={index} className="h-6 bg-gray-700 rounded w-20"></div>
//                 ))}
//               </div>

//               {/* Portfolio Grid Skeleton */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {[...Array(6)].map((_, index) => (
//                   <div key={index} className="animate-pulse">
//                     <div className="aspect-square bg-gray-700 rounded mb-2"></div>
//                     <div className="flex justify-between items-center">
//                       <div className="h-4 bg-gray-700 rounded w-24"></div>
//                       <div className="h-5 w-5 bg-gray-700 rounded"></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <>
//               {/* Stats Grid - 4 categories */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-12">
//                 {/* Digital */}
//                 <div>
//                   <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
//                     {stats.digital}
//                   </p>
//                   <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
//                     DIGITAL
//                   </p>
//                 </div>

//                 {/* Nature */}
//                 <div>
//                   <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
//                     {stats.nature}
//                   </p>
//                   <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
//                     NATURE
//                   </p>
//                 </div>

//                 {/* Wildlife */}
//                 <div>
//                   <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
//                     {stats.wildlife}
//                   </p>
//                   <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
//                     WILDLIFE
//                   </p>
//                 </div>

//                 {/* Landscape */}
//                 <div>
//                   <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
//                     {stats.landscape}
//                   </p>
//                   <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
//                     LANDSCAPE
//                   </p>
//                 </div>
//               </div>

//               {/* Category Filter Tabs */}
//               <div className="flex gap-6 md:gap-8 mb-8 overflow-x-auto pb-2">
//                 <button
//                   onClick={() => setActiveCategory('digital')}
//                   className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
//                     activeCategory === 'digital' 
//                       ? 'text-white font-medium' 
//                       : 'text-gray-500 font-normal hover:text-gray-300'
//                   }`}
//                 >
//                   DIGITAL
//                 </button>
//                 <button
//                   onClick={() => setActiveCategory('nature')}
//                   className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
//                     activeCategory === 'nature' 
//                       ? 'text-white font-medium' 
//                       : 'text-gray-500 font-normal hover:text-gray-300'
//                   }`}
//                 >
//                   NATURE
//                 </button>
//                 <button
//                   onClick={() => setActiveCategory('wildlife')}
//                   className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
//                     activeCategory === 'wildlife' 
//                       ? 'text-white font-medium' 
//                       : 'text-gray-500 font-normal hover:text-gray-300'
//                   }`}
//                 >
//                   WILDLIFE
//                 </button>
//                 <button
//                   onClick={() => setActiveCategory('landscape')}
//                   className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
//                     activeCategory === 'landscape' 
//                       ? 'text-white font-medium' 
//                       : 'text-gray-500 font-normal hover:text-gray-300'
//                   }`}
//                 >
//                   LANDSCAPE
//                 </button>
//               </div>

//               {/* Portfolio Grid */}
//               {filteredPortfolios.length === 0 ? (
//                 <p className="text-gray-400 font-dm-sans text-sm md:text-base">
//                   No portfolios in this category yet.
//                 </p>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {filteredPortfolios.map((portfolio) => {
//                     const imageUrl = getFirstImageUrl(portfolio);
//                     const imageCount = portfolio.images?.length || 0;

//                     return (
//                       <div key={portfolio.id} className="group">
//                         {/* Image */}
//                         <div className="relative aspect-square bg-gray-700 rounded overflow-hidden mb-2">
//                           {imageUrl ? (
//                             <img 
//                               src={imageUrl} 
//                               alt={portfolio.title}
//                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center text-gray-500">
//                               No Image
//                             </div>
//                           )}
                          
//                           {/* Album badge if multiple images */}
//                           {imageCount > 1 && (
//                             <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs font-dm-sans px-2 py-1 rounded flex items-center gap-1">
//                               <svg 
//                                 className="w-4 h-4" 
//                                 fill="none" 
//                                 stroke="currentColor" 
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path 
//                                   strokeLinecap="round" 
//                                   strokeLinejoin="round" 
//                                   strokeWidth={2} 
//                                   d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
//                                 />
//                               </svg>
//                               {imageCount}
//                             </div>
//                           )}
//                         </div>

//                         {/* Title and Delete Action */}
//                         <div className="flex items-center justify-between">
//                           <p className="font-dm-sans text-sm md:text-base text-white">
//                             {portfolio.title}
//                           </p>
//                           {/* Delete Icon Only */}
//                           <button
//                             onClick={() => handleDeletePortfolio(portfolio)}
//                             className="hover:text-red-500 transition-colors"
//                           >
//                             <svg 
//                               className="w-4 h-4 md:w-5 md:h-5" 
//                               fill="none" 
//                               stroke="currentColor" 
//                               viewBox="0 0 24 24"
//                             >
//                               <path 
//                                 strokeLinecap="round" 
//                                 strokeLinejoin="round" 
//                                 strokeWidth={2} 
//                                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default AdminPortfolio;


import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAdminPortfolioStore from '../../stores/useAdminPortfolioStore';
import AdminNotification from '../../components/AdminNotification';
import Select from 'react-select';
import adminLogo from '../../assets/adminLogo.png';


function AdminPortfolio() {
  const location = useLocation();
  
  // Zustand store
  const { portfolios, fetchPortfolios, loading, addPortfolio, deletePortfolio } = useAdminPortfolioStore();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active category filter
  const [activeCategory, setActiveCategory] = useState('portraits');

  // Add work modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: '',
    category: null
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPortfolio, setDeletingPortfolio] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: ''
  });

  // Category options for dropdown
  const categoryOptions = [
    { value: 'portraits', label: 'Portraits' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'product-lifestyle', label: 'Product Lifestyle' },
    { value: 'street-travel', label: 'Street + Travel' }
  ];

  // Custom styles for react-select (dark theme)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: 'white',
      borderRadius: 0,
      padding: '6px 4px',
      boxShadow: state.isFocused ? '0 0 0 1px white' : 'none',
      '&:hover': {
        borderColor: 'white'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#171F22',
      border: '1px solid white',
      borderRadius: 0
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#374151' : state.isFocused ? '#1f2937' : 'transparent',
      color: 'white',
      '&:hover': {
        backgroundColor: '#1f2937'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280'
    }),
    input: (base) => ({
      ...base,
      color: 'white'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'white',
      '&:hover': {
        color: 'white'
      }
    })
  };

  // Stats calculation
  const stats = {
    portraits: portfolios.filter(p => p.category?.toLowerCase() === 'portraits').length,
    editorial: portfolios.filter(p => p.category?.toLowerCase() === 'editorial').length,
    productLifestyle: portfolios.filter(p => p.category?.toLowerCase() === 'product-lifestyle').length,
    streetTravel: portfolios.filter(p => p.category?.toLowerCase() === 'street-travel').length
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

  // Fetch data on mount
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const isActive = (path) => location.pathname === path;

  // Filter portfolios by active category
  const filteredPortfolios = portfolios.filter(
    p => p.category?.toLowerCase() === activeCategory.toLowerCase()
  );

  // Get first image URL from portfolio
  const getFirstImageUrl = (portfolio) => {
    if (!portfolio.images || portfolio.images.length === 0) return null;
    const firstImage = portfolio.images[0];
    if (typeof firstImage === 'string') return firstImage;
    return firstImage.image_url || firstImage.url || null;
  };

  // Handle add work modal
  const handleAddWork = () => {
    setShowAddModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category change
  const handleCategoryChange = (selectedOption) => {
    setAddFormData(prev => ({
      ...prev,
      category: selectedOption
    }));
  };

  // Handle multiple image selection - APPEND to existing selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Append new files to existing selection
      setSelectedImages(prev => [...prev, ...files]);
      // Create preview URLs for new files and append to existing previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  // Remove a selected image by index
  const handleRemoveImage = (indexToRemove) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    // Remove from both arrays
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Reset add form
  const resetAddForm = () => {
    setAddFormData({
      title: '',
      category: null
    });
    setSelectedImages([]);
    // Revoke preview URLs to free memory
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
  };

  // Handle add form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      // Validation
      if (selectedImages.length === 0) {
        throw new Error('Please select at least one image');
      }
      if (!addFormData.title) {
        throw new Error('Please enter a title');
      }
      if (!addFormData.category) {
        throw new Error('Please select a category');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', addFormData.title);
      formData.append('category', addFormData.category.value);
      
      // Append all selected images
      selectedImages.forEach(file => {
        formData.append('files', file);
      });

      console.log('📤 Adding portfolio...');
      await addPortfolio(formData);

      // Show success notification
      showNotification('Portfolio added successfully!');

      // Refresh portfolios list
      fetchPortfolios();

      // Close modal after short delay
      setTimeout(() => {
        resetAddForm();
        setShowAddModal(false);
      }, 1500);

    } catch (err) {
      console.error('❌ Error adding portfolio:', err);
      
      let errorMessage = 'Failed to add portfolio. Please try again.';
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

  // Handle delete portfolio
  const handleDeletePortfolio = (portfolio) => {
    setDeletingPortfolio(portfolio);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDeletePortfolio = async () => {
    if (!deletingPortfolio) return;
    
    setDeleting(true);
    try {
      console.log('🗑️ Deleting portfolio:', deletingPortfolio.id);
      await deletePortfolio(deletingPortfolio.id);
      
      // Show success notification
      showNotification(`"${deletingPortfolio.title}" deleted successfully!`);
      
      // Refresh portfolios list
      fetchPortfolios();
      
      // Close modal
      setShowDeleteModal(false);
      setDeletingPortfolio(null);
      
    } catch (err) {
      console.error('❌ Error deleting portfolio:', err);
      
      let errorMessage = 'Failed to delete portfolio. Please try again.';
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
    setDeletingPortfolio(null);
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

      {/* Add Work Modal - Full page overlay */}
      {showAddModal && (
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
                <Link to="/admin/orders" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  ORDERS
                </Link>
                <Link to="/admin/store" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  STORE
                </Link>
                <Link to="/admin/portfolio" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
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
                PORTFOLIO
              </h2>

              {/* Add Form */}
              <form onSubmit={handleAddSubmit} className="space-y-4 max-w-5xl p-6">
                {/* Image Upload */}
                <div>
                  <label 
                    htmlFor="portfolio-image-upload"
                    className="block w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-gray-500 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {selectedImages.length > 0 ? (
                      <span className="text-white">{selectedImages.length} image(s) selected</span>
                    ) : (
                      'UPLOAD IMAGE/IMAGES'
                    )}
                  </label>
                  <input
                    id="portfolio-image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={adding}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -left-2 w-5 h-5 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors z-10"
                            disabled={adding}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-20 h-20 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <input
                    type="text"
                    name="title"
                    value={addFormData.title}
                    onChange={handleInputChange}
                    placeholder="ENTER TITLE"
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white"
                    disabled={adding}
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <Select
                    value={addFormData.category}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                    placeholder="ENTER CATEGORY"
                    styles={selectStyles}
                    isDisabled={adding}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={adding}
                    className="bg-transparent border border-white text-white font-dm-sans px-6 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adding ? 'ADDING...' : 'ADD WORK'}
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#171F22] border border-gray-700 p-6 md:p-8 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-4">
              DELETE PORTFOLIO
            </h3>
            <p className="font-dm-sans text-gray-300 mb-6">
              Are you sure you want to delete "<span className="text-white font-medium">{deletingPortfolio.title}</span>"? This action cannot be undone.
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
                onClick={confirmDeletePortfolio}
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
              PORTFOLIO
            </h2>
            <button
              onClick={handleAddWork}
              className="flex items-center gap-2 bg-transparent border border-white text-white font-dm-sans text-sm px-4 py-1 hover:bg-white hover:text-[#171F22] transition-colors"
            >
              <span className="text-lg">+</span>
              ADD WORK
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <>
              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-12">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-12 md:h-16 bg-gray-700 rounded w-16 md:w-20 mb-2"></div>
                    <div className="h-3 md:h-4 bg-gray-700 rounded w-16 md:w-20"></div>
                  </div>
                ))}
              </div>

              {/* Category Tabs Skeleton */}
              <div className="flex gap-6 mb-8 animate-pulse">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-6 bg-gray-700 rounded w-20"></div>
                ))}
              </div>

              {/* Portfolio Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-square bg-gray-700 rounded mb-2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                      <div className="h-5 w-5 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Stats Grid - 4 categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 mb-8 md:gap-6 md:mb-12">
                {/* Portraits */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.portraits}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    PORTRAITS
                  </p>
                </div>

                {/* Editorial */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.editorial}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    EDITORIAL
                  </p>
                </div>

                {/* Product Lifestyle */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.productLifestyle}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    PRODUCT LIFESTYLE
                  </p>
                </div>

                {/* Street + Travel */}
                <div>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-dm-sans font-bold mb-1">
                    {stats.streetTravel}
                  </p>
                  <p className="text-[10px] md:text-sm font-dm-sans text-gray-400 leading-tight uppercase tracking-wide">
                    STREET + TRAVEL
                  </p>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-6 md:gap-8 mb-8 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveCategory('portraits')}
                  className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
                    activeCategory === 'portraits' 
                      ? 'text-white font-medium' 
                      : 'text-gray-500 font-normal hover:text-gray-300'
                  }`}
                >
                  PORTRAITS
                </button>
                <button
                  onClick={() => setActiveCategory('editorial')}
                  className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
                    activeCategory === 'editorial' 
                      ? 'text-white font-medium' 
                      : 'text-gray-500 font-normal hover:text-gray-300'
                  }`}
                >
                  EDITORIAL
                </button>
                <button
                  onClick={() => setActiveCategory('product-lifestyle')}
                  className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
                    activeCategory === 'product-lifestyle' 
                      ? 'text-white font-medium' 
                      : 'text-gray-500 font-normal hover:text-gray-300'
                  }`}
                >
                  PRODUCT LIFESTYLE
                </button>
                <button
                  onClick={() => setActiveCategory('street-travel')}
                  className={`font-dm-sans text-sm md:text-base uppercase whitespace-nowrap transition-colors ${
                    activeCategory === 'street-travel' 
                      ? 'text-white font-medium' 
                      : 'text-gray-500 font-normal hover:text-gray-300'
                  }`}
                >
                  STREET + TRAVEL
                </button>
              </div>

              {/* Portfolio Grid */}
              {filteredPortfolios.length === 0 ? (
                <p className="text-gray-400 font-dm-sans text-sm md:text-base">
                  No portfolios in this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPortfolios.map((portfolio) => {
                    const imageUrl = getFirstImageUrl(portfolio);
                    const imageCount = portfolio.images?.length || 0;

                    return (
                      <div key={portfolio.id} className="group">
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-700 rounded overflow-hidden mb-2">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={portfolio.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              No Image
                            </div>
                          )}
                          
                          {/* Album badge if multiple images */}
                          {imageCount > 1 && (
                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs font-dm-sans px-2 py-1 rounded flex items-center gap-1">
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
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                              {imageCount}
                            </div>
                          )}
                        </div>

                        {/* Title and Delete Action */}
                        <div className="flex items-center justify-between">
                          <p className="font-dm-sans text-sm md:text-base text-white">
                            {portfolio.title}
                          </p>
                          {/* Delete Icon Only */}
                          <button
                            onClick={() => handleDeletePortfolio(portfolio)}
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
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPortfolio;