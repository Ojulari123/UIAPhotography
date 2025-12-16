import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePortfolioStore from '../stores/usePortfolioStore';
import Modal from '../components/Modal';

// Import images
import digitalBg from '../assets/digital.png';
import natureBg from '../assets/nature.png';
import wildlifeBg from '../assets/wildlife.png';
import landscapeBg from '../assets/landscape.png';

function CategoryPage() {
  const { category } = useParams();
  const { portfolios, fetchPortfolios, loading } = usePortfolioStore();
  
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [viewMode, setViewMode] = useState('singles'); // 'singles' or 'albums'

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Helper function to extract image URL from various formats
  const getImageUrl = (images, index = 0) => {
    if (!images) return null;

    if (Array.isArray(images)) {
      const image = images[index];
      
      if (typeof image === 'string') {
        return image;
      }
      
      if (image && image.image_url) {
        return image.image_url;
      }
      
      if (image && image.url) {
        return image.url;
      }
    }
    
    if (typeof images === 'string') {
      return images;
    }
    
    if (images.image_url) {
      return images.image_url;
    }
    
    if (images.url) {
      return images.url;
    }

    return null;
  };

  // Get all image URLs from a portfolio
  const getAllImageUrls = (images) => {
    if (!images) return [];
    
    if (Array.isArray(images)) {
      return images.map((img, idx) => getImageUrl(images, idx)).filter(Boolean);
    }
    
    const singleUrl = getImageUrl(images);
    return singleUrl ? [singleUrl] : [];
  };

  // Check if portfolio is an album (has multiple images)
  const isAlbum = (portfolio) => {
    const imageUrls = getAllImageUrls(portfolio.images);
    return imageUrls.length > 1;
  };

  // Filter portfolios by category
  const categoryPortfolios = portfolios.filter(
    portfolio => portfolio.category.toLowerCase() === category.toLowerCase()
  );

  // Separate singles and albums
  const singles = categoryPortfolios.filter(p => !isAlbum(p));
  const albums = categoryPortfolios.filter(p => isAlbum(p));

  // Get current display list based on view mode
  const displayPortfolios = viewMode === 'singles' ? singles : albums;

  // Get background image based on category
  const getCategoryBg = () => {
    const categoryMap = {
      digital: digitalBg,
      nature: natureBg,
      wildlife: wildlifeBg,
      landscape: landscapeBg,
    };
    return categoryMap[category.toLowerCase()] || categoryMap.digital;
  };

  const handlePortfolioClick = (portfolio, portfolioIndex) => {
    setSelectedPortfolio(portfolio);
    setSelectedPortfolioIndex(portfolioIndex);
    setCurrentImageIndex(0);
    setIsAlbumModalOpen(true);
  };

  const handleNextImage = () => {
    if (!selectedPortfolio) return;
    
    const currentPortfolioImages = getAllImageUrls(selectedPortfolio.images);
    
    // If we're not at the last image of current portfolio, go to next image
    if (currentImageIndex < currentPortfolioImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Move to next portfolio in current view
      const nextPortfolioIndex = (selectedPortfolioIndex + 1) % displayPortfolios.length;
      const nextPortfolio = displayPortfolios[nextPortfolioIndex];
      setSelectedPortfolio(nextPortfolio);
      setSelectedPortfolioIndex(nextPortfolioIndex);
      setCurrentImageIndex(0);
    }
  };

  const handlePrevImage = () => {
    if (!selectedPortfolio) return;
    
    // If we're not at the first image of current portfolio, go to previous image
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      // Move to previous portfolio in current view
      const prevPortfolioIndex = selectedPortfolioIndex === 0 
        ? displayPortfolios.length - 1 
        : selectedPortfolioIndex - 1;
      const prevPortfolio = displayPortfolios[prevPortfolioIndex];
      const prevPortfolioImages = getAllImageUrls(prevPortfolio.images);
      setSelectedPortfolio(prevPortfolio);
      setSelectedPortfolioIndex(prevPortfolioIndex);
      setCurrentImageIndex(prevPortfolioImages.length - 1);
    }
  };

  const closeModal = () => {
    setIsAlbumModalOpen(false);
    setSelectedPortfolio(null);
    setSelectedPortfolioIndex(0);
    setCurrentImageIndex(0);
  };

  const handleImageLoad = (portfolioId) => {
    setLoadedImages(prev => new Set([...prev, portfolioId]));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Category Background */}
      <section className="relative w-full h-[40vh] md:h-[80vh] overflow-hidden">
        <img 
          src={getCategoryBg()} 
          alt={category} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          {/* Back to Portfolio Link */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8">
            <Link 
              to="/portfolio" 
              className="text-white font-dm-sans text-sm md:text-base flex items-center gap-2 transition-all"
            >
              <svg 
                className="w-5 h-5" 
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
              BACK TO PORTFOLIO
            </Link>
          </div>

          {/* Category Title - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider uppercase">
              {category}
            </h1>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Toggle Buttons */}
        <div className="flex items-center gap-1 mb-8">
          <button
            onClick={() => setViewMode('singles')}
            className={`font-dm-sans text-lg md:text-xl transition-colors ${
              viewMode === 'singles' 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-400 font-normal'
            }`}
          >
            SINGLES
          </button>
          <span className="text-gray-400 font-dm-sans text-lg md:text-xl">/</span>
          <button
            onClick={() => setViewMode('albums')}
            className={`font-dm-sans text-lg md:text-xl transition-colors ${
              viewMode === 'albums' 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-400 font-normal'
            }`}
          >
            ALBUMS
          </button>
        </div>

        {loading ? (
          // Skeleton Loaders while fetching
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="relative mb-3">
                  <div className="rounded-lg aspect-square bg-gray-200"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : displayPortfolios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No {viewMode === 'singles' ? 'single images' : 'albums'} in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayPortfolios.map((portfolio, index) => {
              const imageUrls = getAllImageUrls(portfolio.images);
              const firstImageUrl = imageUrls[0];
              const secondImageUrl = imageUrls[1];
              const portfolioIsAlbum = isAlbum(portfolio);
              const imageCount = imageUrls.length;
              const isImageLoaded = loadedImages.has(portfolio.portfolio_id);

              return (
                <div 
                  key={`${portfolio.portfolio_id}-${index}`}
                  className="cursor-pointer group"
                  onClick={() => handlePortfolioClick(portfolio, index)}
                >
                  {/* Image Container */}
                  <div className="relative mb-3">
                    {/* Main Image */}
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      {firstImageUrl ? (
                        <>
                          {/* Skeleton Loader */}
                          {!isImageLoaded && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                          )}
                          
                          <img 
                            src={firstImageUrl} 
                            alt={portfolio.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              isImageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            crossOrigin="anonymous"
                            onLoad={() => handleImageLoad(portfolio.portfolio_id)}
                          />
                          
                          {/* Album Badge - Show if multiple images */}
                          {portfolioIsAlbum && isImageLoaded && (
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
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <p className="text-sm">No Image</p>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                    </div>

                    {/* Second Image Peeking (Album Only) */}
                    {portfolioIsAlbum && secondImageUrl && isImageLoaded && (
                      <div className="absolute top-2 -right-2 w-[30%] h-[94%] rounded-lg overflow-hidden shadow-lg z-[-1]">
                        <img 
                          src={secondImageUrl} 
                          alt={`${portfolio.title} preview`}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-gray-900 font-dm-sans text-sm md:text-base">
                    {portfolio.title}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Album/Image Modal */}
      <Modal 
        isOpen={isAlbumModalOpen} 
        onClose={closeModal}
        showNavigation={displayPortfolios.length > 0}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      >
        {selectedPortfolio && (() => {
          const imageUrls = getAllImageUrls(selectedPortfolio.images);
          const currentImageUrl = imageUrls[currentImageIndex];
          const portfolioIsAlbum = imageUrls.length > 1;
          
          return (
            <div className="flex flex-col items-center">
              <img 
                src={currentImageUrl}
                alt={`${selectedPortfolio.title} - ${currentImageIndex + 1}`} 
                className="max-h-[70vh] w-auto object-contain rounded-lg"
                crossOrigin="anonymous"
              />
              {/* Title and Image counter */}
              <div className="text-white text-center mt-4 font-dm-sans">
                <p className="text-2xl md:text-3xl font-medium mb-2 uppercase">
                  {selectedPortfolio.title}
                </p>
                {/* Image counter - Only show for albums */}
                {portfolioIsAlbum && (
                  <p className="text-sm">
                    {currentImageIndex + 1} / {imageUrls.length}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

export default CategoryPage;