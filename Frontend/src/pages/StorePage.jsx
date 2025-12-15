import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useProductStore from '../stores/useProductStore';
import useCartStore from '../stores/useCartStore';

function StorePage() {
  const { products, fetchProducts, loading } = useProductStore();
  const { addToCart } = useCartStore();
  const [loadedImages, setLoadedImages] = useState(new Set());

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageLoad = (productId) => {
    setLoadedImages(prev => new Set([...prev, productId]));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Store Background */}
      <section className="relative w-full h-[40vh] md:h-[80vh] overflow-hidden">
        <img 
          src="/src/assets/store.png" 
          alt="Store" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
            STORE
          </h1>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          // Skeleton Loaders while fetching
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                {/* Skeleton Image */}
                <div className="relative mb-2">
                  <div className="rounded-lg aspect-square bg-gray-200"></div>
                </div>
                {/* Skeleton Title */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                {/* Skeleton Price */}
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isImageLoaded = loadedImages.has(product.id);

              return (
                <div 
                  key={product.id}
                  className="group"
                >
                  {/* Product Image */}
                  <Link to={`/products/${product.slug}`}>
                    <div className="relative rounded-lg overflow-hidden aspect-square mb-2 bg-gray-100">
                      {/* Skeleton Loader */}
                      {!isImageLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                      )}

                      <img 
                        src={product.image_url}  
                        alt={product.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          isImageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(product.id)}
                      />
                      
                      {/* Badge - Only show after image loads */}
                      {isImageLoaded && (
                        <>
                          {product.is_for_sale ? (
                            <div className="absolute top-2 left-2 bg-black bg-opacity-20 text-white text-xs font-dm-sans px-2 py-1 rounded">
                              AVAILABLE
                            </div>
                          ) : (
                            <div className="absolute top-2 left-2 bg-black bg-opacity-20 text-white text-xs font-dm-sans px-2 py-1 rounded">
                              SOLD OUT
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="space-y-1">
                    {/* Desktop: Title and Size on same line */}
                    <div className="hidden md:flex items-center justify-between">
                      <Link to={`/products/${product.slug}`}>
                        <h3 className="text-gray-900 font-dm-sans text-base hover:text-gray-600 transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <span className="text-gray-500 text-xs font-dm-sans uppercase flex-shrink-0 ml-2">
                        {product.dimensions}
                      </span>
                    </div>

                    {/* Mobile: Title alone */}
                    <Link to={`/products/${product.slug}`} className="md:hidden">
                      <h3 className="text-gray-900 font-dm-sans text-sm hover:text-gray-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    
                    {/* Desktop: Price alone */}
                    <p className="hidden md:block text-gray-900 font-dm-sans text-base">
                      £{product.price}
                    </p>

                    {/* Mobile: Price and Size on same line */}
                    <div className="flex md:hidden items-center justify-between">
                      <p className="text-gray-900 font-dm-sans text-sm">
                        £{product.price}
                      </p>
                      <span className="text-gray-500 text-xs font-dm-sans uppercase flex-shrink-0">
                        {product.dimensions}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default StorePage;
