import { Link } from 'react-router-dom';

function PortfolioPage() {
  return (
    <div className="min-h-screen">
      {/* Digital Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src="/src/assets/digital.png" 
          alt="Digital" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
              DIGITAL
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/digital"
              className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Nature Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src="/src/assets/nature.png" 
          alt="Nature" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
              NATURE
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/nature"
              className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Wildlife Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src="/src/assets/wildlife.png" 
          alt="Wildlife" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
              WILDLIFE
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/wildlife"
              className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Landscape Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src="/src/assets/landscape.png" 
          alt="Landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
              LANDSCAPE
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/landscape"
              className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PortfolioPage;