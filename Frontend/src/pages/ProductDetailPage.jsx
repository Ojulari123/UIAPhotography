import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Select from 'react-select';
import useProductStore from '../stores/useProductStore';
import useCartStore from '../stores/useCartStore';
import Notification from '../components/Notification';

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts, loading } = useProductStore();
  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [productType, setProductType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  // Format options for react-select
  const formatOptions = [
    { value: 'digital', label: 'DIGITAL COPY' },
    { value: 'physical', label: 'PHYSICAL COPY' }
  ];

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      border: '2px solid #000',
      borderRadius: 0,
      padding: '8px 4px',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        border: '2px solid #000'
      },
      minHeight: '56px'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9CA3AF',
      fontSize: '16px',
      fontFamily: 'DM Sans, sans-serif'
    }),
    singleValue: (base) => ({
      ...base,
      color: '#000',
      fontSize: '16px',
      fontFamily: 'DM Sans, sans-serif'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 0,
      marginTop: '4px',
      border: '2px solid #000',
      boxShadow: 'none'
    }),
    menuList: (base) => ({
      ...base,
      padding: 0
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#F3F4F6' : 'white',
      color: '#000',
      cursor: 'pointer',
      padding: '12px 16px',
      fontSize: '16px',
      fontFamily: 'DM Sans, sans-serif',
      borderBottom: '1px solid #E5E7EB',
      '&:last-child': {
        borderBottom: 'none'
      },
      '&:active': {
        backgroundColor: '#E5E7EB'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#000',
      '&:hover': {
        color: '#000'
      }
    })
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset image loaded state when slug changes (navigating to different product)
  useEffect(() => {
    setImageLoaded(false);
    setProductType(null); // Reset format selection when product changes
  }, [slug]);

  useEffect(() => {
    if (products.length > 0) {
      const product = products.find(p => p.slug === slug);
      setSelectedProduct(product);
    }
  }, [products, slug]);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    // Validate format selection
    if (!productType) {
      setNotificationMessage('PLEASE SELECT A FORMAT');
      setShowNotification(true);
      return;
    }

    if (selectedProduct && selectedProduct.is_for_sale) {
      addToCart(selectedProduct, quantity, productType.value);
      setNotificationMessage('ADDED TO CART');
      setShowNotification(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const closeNotification = () => {
    setShowNotification(false);
  };
  
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12">
          {/* Back to Store Link Skeleton */}
          <div className="h-4 w-32 bg-gray-200 rounded mb-8 animate-pulse"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Skeleton */}
            <div className="rounded-lg bg-gray-200 max-h-[50vh] lg:max-h-[70vh] aspect-square animate-pulse"></div>

            {/* Metafields Skeleton */}
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Product Details Skeleton */}
            <div className="flex flex-col justify-between min-h-[45vh] lg:min-h-[70vh]">
              <div className="space-y-8">
                {/* Title Skeleton */}
                <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>

                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                </div>

                {/* Dimensions Skeleton */}
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>

                {/* Price Skeleton */}
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>

              {/* Bottom Section Skeleton */}
              <div className="space-y-6">
                {/* Format Selector Skeleton */}
                <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>

                {/* Quantity Selector Skeleton */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-14 h-14 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Button Skeleton */}
                <div className="w-full h-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="text-gray-900 hover:underline"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  // Check if description exists and is not the default "string" value
  const hasDescription = selectedProduct.description &&
    selectedProduct.description !== 'string' &&
    selectedProduct.description.trim() !== '';

  return (
    <div className="min-h-screen bg-white">
      {/* Notification */}
      <Notification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={closeNotification}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12">
        {/* Back to Store Link */}
        <Link
          to="/products"
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
          BACK TO STORE
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-6">
            {/* Image Container - Clickable with Hover Overlay */}
            <div 
              className="relative rounded-lg overflow-hidden bg-gray-100 max-h-[50vh] lg:max-h-[80vh] flex items-center justify-center cursor-pointer group"
              onClick={openModal}
            >
              {/* Image Skeleton Loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              )}

              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.title}
                className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                <p className="text-white font-dm-sans text-sm md:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  CLICK TO SHOW FULL PHOTO
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between min-h-[45vh] lg:min-h-[70vh]">
            <div className="space-y-8">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-dm-sans">
                {selectedProduct.title}
              </h1>

              {/* Description - Only show if exists and is not "string" */}
              {hasDescription && (
                <p className="text-gray-700 font-dm-sans leading-relaxed text-base">
                  {selectedProduct.description}
                </p>
              )}

              {/* Size/Dimensions */}
              <p className="text-gray-700 font-dm-sans text-base">
                {selectedProduct.dimensions}
              </p>

              {/* Price */}
              <p className="text-3xl font-bold text-gray-900 font-dm-sans">
                £{selectedProduct.price}
              </p>
            </div>

            {/* Bottom Section: Format Selector + Quantity + Add to Cart */}
            <div className="space-y-6 mt-2 lg:mt-0">
              {/* Format Selector */}
              <div className="w-full lg:w-2/3 mt-8">
                <Select
                  value={productType}
                  onChange={setProductType}
                  options={formatOptions}
                  styles={customSelectStyles}
                  placeholder="SELECT PREFERRED FORMAT"
                  isSearchable={false}
                  className="font-dm-sans"
                />
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-14 h-14 border-2 border-gray-900 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl font-light">−</span>
                </button>

                <span className="text-2xl font-dm-sans text-gray-900 w-16 text-center">
                  {quantity}
                </span>

                <button
                  onClick={handleIncrement}
                  className="w-14 h-14 border-2 border-gray-900 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl font-light">+</span>
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedProduct.is_for_sale}
                className="w-full bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-lg py-5 hover:bg-white hover:text-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#282C2D] disabled:hover:text-white"
              >
                {selectedProduct.is_for_sale ? 'ADD TO CART' : 'SOLD OUT'}
              </button>

              {/* Availability Status */}
              {!selectedProduct.is_for_sale && (
                <p className="text-[#282C2D]-600 font-dm-sans text-sm">
                  This item is currently sold out
                </p>
              )}
            </div>
          </div>
        </div>

              {/* PROPERTIES Dropdown Toggle */}
{(() => {
  const validMetafields = [];
  
  if (selectedProduct.resolution && selectedProduct.resolution !== 'string' && selectedProduct.resolution.trim() !== '') {
    validMetafields.push({ label: 'RESOLUTION:', value: selectedProduct.resolution });
  }
  if (selectedProduct.dimensions && selectedProduct.dimensions !== 'string' && selectedProduct.dimensions.trim() !== '') {
    validMetafields.push({ label: 'DIMENSION:', value: selectedProduct.dimensions });
  }
  if (selectedProduct.file_size_mb && selectedProduct.file_size_mb !== 'string' && selectedProduct.file_size_mb.toString().trim() !== '' && selectedProduct.file_size_mb !== 0) {
    validMetafields.push({ label: 'FILE SIZE(mb):', value: selectedProduct.file_size_mb });
  }
  if (selectedProduct.file_format && selectedProduct.file_format !== 'string' && selectedProduct.file_format.trim() !== '') {
    validMetafields.push({ label: 'FILE FORMAT:', value: selectedProduct.file_format });
  }

  // If no metafields, don't render anything
  if (validMetafields.length === 0) return null;

  return (
    <div className="mt-10">
      {/* Toggle Button */}
      <button
        onClick={() => setShowProperties(!showProperties)}
        className="flex items-center gap-2 text-gray-900 font-dm-sans text-sm font-medium hover:text-black transition-colors"
      >
        <span>PROPERTIES</span>
        <svg
          className={`w-4 h-4 transition-transform ${showProperties ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Metafields Content */}
      {showProperties && (
        <div className="mt-4 max-w-[80%] sm:max-w-[80%] md:max-w-[80%] lg:max-w-[40%] w-full">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {validMetafields.map((field, index) => (
              <div key={index}>
                <p className="text-gray-600 font-dm-sans text-xs uppercase mb-1">
                  {field.label}
                </p>
                <p className="text-gray-900 font-dm-sans">
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
})()}
      </div>      

      {/* Image Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal Image */}
          <img
            src={selectedProduct.image_url}
            alt={selectedProduct.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;