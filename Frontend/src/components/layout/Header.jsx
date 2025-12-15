// import { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import useCartStore from '../../stores/useCartStore';

// function Header() {
//   const { cartItems } = useCartStore();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const location = useLocation();

//   const navLinks = [
//     { path: '/portfolio', label: 'PORTFOLIO' },
//     { path: '/products', label: 'STORE' },
//     { path: '/contact', label: 'CONTACT' },
//   ];

//   const isActive = (path) => location.pathname === path;

//   return (
//     <header className="bg-white border-b border-border-gray sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-6 lg:px-12">
//         <div className="flex items-center justify-between h-20">
//           {/* Logo */}
//           <Link to="/" className="flex items-center flex-shrink-0">
//             <img 
//               src="/src/assets/logo.png" 
//               alt="UIA Photography" 
//               className="h-16 w-auto"
//             />
//           </Link>

//           {/* Desktop Navigation - Centered */}
//           <nav className="hidden md:flex items-center space-x-16 font-dm-mono absolute left-1/2 transform -translate-x-1/2">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className={`text-base tracking-wider transition-all ${
//                   isActive(link.path)
//                     ? 'font-medium text-gray-900'
//                     : 'font-normal text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </nav>

//           {/* Cart Icon - Desktop */}
//           <Link 
//             to="/cart" 
//             className="hidden md:block relative flex-shrink-0"
//           >
//             <img 
//               src="/src/assets/ShoppingCart.svg" 
//               alt="Cart" 
//               className="w-6 h-6"
//             />
//             {cartItems.length > 0 && (
//               <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
//                 {cartItems.length}
//               </span>
//             )}
//           </Link>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="md:hidden flex flex-col space-y-1.5"
//             aria-label="Toggle menu"
//           >
//             <span className="block w-7 h-0.5 bg-gray-900"></span>
//             <span className="block w-7 h-0.5 bg-gray-900"></span>
//             <span className="block w-7 h-0.5 bg-gray-900"></span>
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <nav className="md:hidden bg-white border-t border-border-gray py-6 font-dm-mono">
//             <div className="flex flex-col space-y-6">
//               {navLinks.map((link, index) => (
//                 <div key={link.path}>
//                   <Link
//                     to={link.path}
//                     onClick={() => setIsMenuOpen(false)}
//                     className={`block text-lg tracking-wider transition-all ${
//                       isActive(link.path)
//                         ? 'font-medium text-gray-900'
//                         : 'font-normal text-gray-600'
//                     }`}
//                   >
//                     {link.label}
//                   </Link>
//                   {index < navLinks.length - 1 && (
//                     <div className="h-px bg-border-gray mt-6"></div>
//                   )}
//                 </div>
//               ))}
              
//               {/* Cart in Mobile Menu */}
//               <div className="h-px bg-border-gray"></div>
//               <Link
//                 to="/cart"
//                 onClick={() => setIsMenuOpen(false)}
//                 className="flex items-center justify-between text-lg font-normal text-gray-600 tracking-wider"
//               >
//                 <span>CART</span>
//                 {cartItems.length > 0 && (
//                   <span className="bg-gray-900 text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center">
//                     {cartItems.length}
//                   </span>
//                 )}
//               </Link>
//             </div>
//           </nav>
//         )}
//       </div>
//     </header>
//   );
// }

// export default Header;



import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useCartStore from '../../stores/useCartStore';

function Header() {
  const { cartItems } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const navLinks = [
    { path: '/portfolio', label: 'PORTFOLIO' },
    { path: '/products', label: 'STORE' },
    { path: '/contact', label: 'CONTACT' },
  ];

  const isActive = (path) => location.pathname === path;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white border-b border-border-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/src/assets/logo.png" 
              alt="UIA Photography" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center space-x-16 font-dm-mono absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base tracking-wider transition-all ${
                  isActive(link.path)
                    ? 'font-medium text-gray-900'
                    : 'font-normal text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart Icon - Desktop */}
          <Link 
            to="/cart" 
            className="hidden md:block relative flex-shrink-0"
          >
            <img 
              src="/src/assets/ShoppingCart.svg" 
              alt="Cart" 
              className="w-6 h-6"
            />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col space-y-1.5"
            aria-label="Toggle menu"
          >
            <span className="block w-7 h-0.5 bg-gray-900"></span>
            <span className="block w-7 h-0.5 bg-gray-900"></span>
            <span className="block w-7 h-0.5 bg-gray-900"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav 
            ref={menuRef}
            className="md:hidden bg-white border-t border-border-gray py-6 font-dm-mono"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link, index) => (
                <div key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-lg tracking-wider transition-all ${
                      isActive(link.path)
                        ? 'font-medium text-gray-900'
                        : 'font-normal text-gray-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {index < navLinks.length - 1 && (
                    <div className="h-px bg-border-gray mt-6"></div>
                  )}
                </div>
              ))}
              
              {/* Cart in Mobile Menu */}
              <div className="h-px bg-border-gray"></div>
              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between text-lg font-normal text-gray-600 tracking-wider"
              >
                <span>CART</span>
                {cartItems.length > 0 && (
                  <span className="bg-gray-900 text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;