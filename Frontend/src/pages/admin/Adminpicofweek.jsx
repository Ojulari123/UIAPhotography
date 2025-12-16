import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAdminPicOfWeekStore from '../../stores/useAdminPicOfWeekStore';
import AdminNotification from '../../components/AdminNotification';
import adminLogo from '../../assets/adminLogo.png';


function AdminPicOfWeek() {
  const location = useLocation();
  
  // Zustand store
  const { pics, fetchAllPics, loading, addPicOfWeek, deletePicOfWeek } = useAdminPicOfWeekStore();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [poem, setPoem] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPic, setDeletingPic] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Poem view modal state
  const [showPoemModal, setShowPoemModal] = useState(false);
  const [viewingPic, setViewingPic] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: ''
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
    fetchAllPics();
  }, [fetchAllPics]);

  const isActive = (path) => location.pathname === path;

  // Sort pics by id descending (newest first) to ensure correct order
  const sortedPics = [...pics].sort((a, b) => b.id - a.id);

  // Get current (latest) pic of the week - first item after sorting
  const currentPic = sortedPics.length > 0 ? sortedPics[0] : null;
  
  // Get previous pics (all except the first one)
  const previousPics = sortedPics.length > 1 ? sortedPics.slice(1) : [];

  // Handle upload modal
  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setPoem('');
  };

  // Handle upload form submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Validation
      if (!selectedImage) {
        throw new Error('Please select an image');
      }
      if (!poem.trim()) {
        throw new Error('Please enter a poem');
      }

      // Create FormData for file upload
      // Backend expects: upload_file (file), title (optional), poem (required)
      const formData = new FormData();
      formData.append('upload_file', selectedImage);
      formData.append('title', ''); // Title is optional, can be empty
      formData.append('poem', poem.trim());

      console.log('📤 Uploading P&POTW...');
      await addPicOfWeek(formData);

      // Show success notification
      showNotification('Pic & Poem of the Week uploaded successfully!');

      // Refresh pics list
      fetchAllPics();

      // Close modal after short delay
      setTimeout(() => {
        resetUploadForm();
        setShowUploadModal(false);
      }, 1500);

    } catch (err) {
      console.error('❌ Error uploading P&POTW:', err);
      
      let errorMessage = 'Failed to upload. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDeletePic = (pic) => {
    setDeletingPic(pic);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDeletePic = async () => {
    if (!deletingPic) return;
    
    setDeleting(true);
    try {
      console.log('🗑️ Deleting P&POTW:', deletingPic.id);
      await deletePicOfWeek(deletingPic.id);
      
      // Show success notification
      showNotification('Pic & Poem of the Week deleted successfully!');
      
      // Refresh pics list
      fetchAllPics();
      
      // Close modal
      setShowDeleteModal(false);
      setDeletingPic(null);
      
    } catch (err) {
      console.error('❌ Error deleting P&POTW:', err);
      
      let errorMessage = 'Failed to delete. Please try again.';
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
    setDeletingPic(null);
  };

  // Open poem modal to view full poem
  const handleViewPoem = (pic) => {
    setViewingPic(pic);
    setShowPoemModal(true);
  };

  // Close poem modal
  const closePoemModal = () => {
    setShowPoemModal(false);
    setViewingPic(null);
  };

  // Re-upload a previous pic & poem as the new current one
  const handleReupload = async (pic) => {
    setUploading(true);
    try {
      // Fetch the image from URL and convert to blob
      const response = await fetch(pic.image_url);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], 'reupload.jpg', { type: blob.type });
      
      // Create FormData with the image and poem
      const formData = new FormData();
      formData.append('upload_file', file);
      formData.append('title', '');
      formData.append('poem', pic.poem);

      console.log('📤 Re-uploading P&POTW...');
      await addPicOfWeek(formData);

      // Show success notification
      showNotification('Pic & Poem re-uploaded as current!');

      // Refresh pics list
      fetchAllPics();

    } catch (err) {
      console.error('❌ Error re-uploading P&POTW:', err);
      
      let errorMessage = 'Failed to re-upload. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage);
    } finally {
      setUploading(false);
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

      {/* Upload Modal - Full page overlay */}
      {showUploadModal && (
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
                <Link to="/admin/portfolio" className="block font-dm-mono text-lg font-normal hover:text-gray-300 transition-colors">
                  PORTFOLIO
                </Link>
                <Link to="/admin/pic-of-week" className="block font-dm-mono text-lg font-medium hover:text-gray-300 transition-colors">
                  P&POTW
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-52 p-4 sm:p-6 lg:p-12 bg-[#171F22] min-h-screen">
              {/* Back Button */}
              <button
                onClick={() => {
                  resetUploadForm();
                  setShowUploadModal(false);
                }}
                className="flex items-center gap-2 text-white font-dm-sans text-sm mb-4 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                BACK
              </button>

              <h2 className="text-2xl md:text-3xl font-dm-sans font-medium mb-8">
                PICTURE & POEM OF THE WEEK
              </h2>

              {/* Upload Form */}
              <form onSubmit={handleUploadSubmit} className="space-y-4 max-w-5xl">
                {/* Image Upload */}
                <div>
                  <label 
                    htmlFor="potw-image-upload"
                    className="block w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-gray-500 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {selectedImage ? (
                      <span className="text-white">{selectedImage.name}</span>
                    ) : (
                      'UPLOAD PICTURE OF THE WEEK'
                    )}
                  </label>
                  <input
                    id="potw-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Poem Textarea */}
                <div>
                  <textarea
                    value={poem}
                    onChange={(e) => setPoem(e.target.value)}
                    placeholder="ENTER POEM"
                    rows={8}
                    className="w-full bg-transparent border border-white px-4 py-3 font-dm-sans text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white resize-none"
                    disabled={uploading}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-transparent border border-white text-white font-dm-sans px-8 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'UPLOADING...' : 'UPLOAD'}
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#171F22] border border-gray-700 p-6 md:p-8 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-dm-sans font-medium mb-4">
              DELETE P&POTW
            </h3>
            <p className="font-dm-sans text-gray-300 mb-6">
              Are you sure you want to delete this Pic & Poem of the Week? This action cannot be undone.
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
                onClick={confirmDeletePic}
                disabled={deleting}
                className="bg-red-600 border border-red-600 text-white font-dm-sans px-6 py-2 hover:bg-red-700 hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poem View Modal */}
      {showPoemModal && viewingPic && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={closePoemModal}
        >
          <div 
            className="bg-[#171F22] border border-gray-700 p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={closePoemModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="mb-6">
              <img 
                src={viewingPic.image_url} 
                alt="Poem Image"
                className="w-full h-auto max-h-64 object-contain rounded"
              />
            </div>

            {/* Poem Label */}
            <p className="font-dm-sans text-sm text-gray-400 uppercase tracking-wide mb-2">
              POEM
            </p>

            {/* Full Poem Text */}
            <p className="font-dm-sans text-sm md:text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
              {viewingPic.poem}
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  closePoemModal();
                  handleReupload(viewingPic);
                }}
                disabled={uploading}
                className="bg-transparent border border-white text-white font-dm-sans px-4 py-2 hover:bg-white hover:text-[#171F22] transition-colors disabled:opacity-50 text-sm"
              >
                RE-UPLOAD AS CURRENT
              </button>
              <button
                onClick={() => {
                  closePoemModal();
                  handleDeletePic(viewingPic);
                }}
                className="bg-red-600 border border-red-600 text-white font-dm-sans px-4 py-2 hover:bg-red-700 hover:border-red-700 transition-colors text-sm"
              >
                DELETE
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
          {/* Header with Title and Upload Button */}
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-dm-sans font-medium">
              PICTURE & POEM OF THE WEEK
            </h2>
            <button
              onClick={handleOpenUploadModal}
              className="flex items-center gap-2 bg-transparent border border-white text-white font-dm-sans text-sm px-4 py-1 hover:bg-white hover:text-[#171F22] transition-colors"
            >
              <span className="text-lg">+</span>
              UPLOAD P&POTW
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <>
              {/* Current P&POTW Skeleton */}
              <div className="mb-12 animate-pulse">
                <div className="w-full aspect-video bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>

              {/* Previous P&POTW Grid Skeleton */}
              <div className="h-4 bg-gray-700 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-square bg-gray-700 rounded mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-700 rounded w-4/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : pics.length === 0 ? (
            <p className="text-gray-400 font-dm-sans text-sm md:text-base">
              No Pic & Poem of the Week uploaded yet. Click the button above to add one.
            </p>
          ) : (
            <>
              {/* Current (Latest) P&POTW */}
              {currentPic && (
                <div className="mb-12">
                  {/* Image - slightly bigger than previous uploads */}
                  <div className="w-full max-w-md mb-4">
                    <div className="aspect-square rounded overflow-hidden">
                      <img 
                        src={currentPic.image_url} 
                        alt="Picture of the Week"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Poem Label */}
                  <p className="font-dm-sans text-sm text-gray-400 uppercase tracking-wide mb-2">
                    POEM
                  </p>

                  {/* Poem Text */}
                  <p className="font-dm-sans text-sm md:text-base text-gray-300 whitespace-pre-wrap max-w-md leading-relaxed">
                    {currentPic.poem}
                  </p>
                </div>
              )}

              {/* Previous P&POTW Section */}
              {previousPics.length > 0 && (
                <>
                  <p className="font-dm-sans text-sm text-gray-400 uppercase tracking-wide mb-4">
                    PREVIOUS P&POTW
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {previousPics.map((pic) => (
                      <div key={pic.id} className="group">
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-700 rounded overflow-hidden mb-2">
                          <img 
                            src={pic.image_url} 
                            alt="Previous P&POTW"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Poem Preview (truncated) - clickable to view full */}
                        <p 
                          onClick={() => handleViewPoem(pic)}
                          className="font-dm-sans text-xs md:text-sm text-gray-400 line-clamp-4 leading-relaxed cursor-pointer hover:text-gray-300 transition-colors mb-2"
                        >
                          {pic.poem}
                        </p>

                        {/* Actions Row - after poem */}
                        <div className="flex justify-end gap-3">
                          {/* Re-upload Icon */}
                          <button
                            onClick={() => handleReupload(pic)}
                            className="hover:text-gray-400 transition-colors disabled:opacity-50"
                            title="Re-upload as current"
                            disabled={uploading}
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
                              />
                            </svg>
                          </button>

                          {/* Delete Icon */}
                          <button
                            onClick={() => handleDeletePic(pic)}
                            className="hover:text-red-500 transition-colors"
                            title="Delete"
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
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPicOfWeek;