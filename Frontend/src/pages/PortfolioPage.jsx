// import { Link } from 'react-router-dom';

// // Import images
// import digitalBg from '../assets/digital.png'; 
// import natureBg from '../assets/nature.png';
// import wildlifeBg from '../assets/wildlife.png';
// import landscapeBg from '../assets/landscape.png';

// function PortfolioPage() {
//   return (
//     <div className="min-h-screen">
//       {/* Digital Category */}
//       <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
//         <img 
//           src={digitalBg} 
//           alt="Digital" 
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
//         <div className="absolute inset-0 flex flex-col">
//           <div className="flex-1 flex items-center justify-center">
//             <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
//               DIGITAL
//             </h2>
//           </div>

//           <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
//             <Link 
//               to="/portfolio/digital"
//               className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
//             >
//               VIEW ALL
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Nature Category */}
//       <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
//         <img 
//           src={natureBg} 
//           alt="Nature" 
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
//         <div className="absolute inset-0 flex flex-col">
//           <div className="flex-1 flex items-center justify-center">
//             <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
//               NATURE
//             </h2>
//           </div>

//           <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
//             <Link 
//               to="/portfolio/nature"
//               className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
//             >
//               VIEW ALL
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Wildlife Category */}
//       <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
//         <img 
//           src={wildlifeBg} 
//           alt="Wildlife" 
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
//         <div className="absolute inset-0 flex flex-col">
//           <div className="flex-1 flex items-center justify-center">
//             <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
//               WILDLIFE
//             </h2>
//           </div>

//           <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
//             <Link 
//               to="/portfolio/wildlife"
//               className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
//             >
//               VIEW ALL
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Landscape Category */}
//       <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
//         <img 
//           src={landscapeBg} 
//           alt="Landscape" 
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
//         <div className="absolute inset-0 flex flex-col">
//           <div className="flex-1 flex items-center justify-center">
//             <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
//               LANDSCAPE
//             </h2>
//           </div>

//           <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
//             <Link 
//               to="/portfolio/landscape"
//               className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
//             >
//               VIEW ALL
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default PortfolioPage;


import { Link } from 'react-router-dom';

// Import images (keeping same images for now, will be changed later)
import digitalBg from '../assets/digital.png'; 
import natureBg from '../assets/nature.png';
import wildlifeBg from '../assets/wildlife.png';
import landscapeBg from '../assets/landscape.png';

function PortfolioPage() {
  return (
    <div className="min-h-screen">
      {/* Portraits Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src={digitalBg} 
          alt="Portraits" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
              PORTRAITS
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/portraits"
              className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src={natureBg} 
          alt="Editorial" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
              EDITORIAL
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/editorial"
              className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Product Lifestyle Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src={wildlifeBg} 
          alt="Product Lifestyle" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider text-center px-4">
              PRODUCT LIFESTYLE
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/productlifestyle"
              className="text-white font-dm-sans text-xs sm:text-sm md:text-base transition-all"
            >
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Street + Travel Category */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src={landscapeBg} 
          alt="Street + Travel" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider text-center px-4">
              STREET + TRAVEL
            </h2>
          </div>

          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <Link 
              to="/portfolio/streettravel"
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