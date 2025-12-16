import { Link } from 'react-router-dom';

// Import images
import logo from '../../assets/logo.png';
import emailIcon from '../../assets/Email.svg';
import instagramIcon from '../../assets/Instagram.svg';
import xIcon from '../../assets/X.svg';

function Footer() {
  return (
    <footer className="bg-white border-t border-footer-dark">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
        {/* Mobile Layout - Logo left, Icons right, no quote */}
        <div className="flex md:hidden items-center justify-between">
          <Link to="/" className="flex-shrink-0">
            <img 
              src={logo} 
              alt="UIA Photography" 
              className="h-10 w-auto"
            />
          </Link>

          <div className="flex items-center space-x-5 flex-shrink-0">
            <a 
              href="mailto:uiaphotography@outlook.com" 
              className="hover:opacity-70 transition-opacity"
              aria-label="Email"
            >
              <img 
                src={emailIcon} 
                alt="Email" 
                className="w-6 h-6"
              />
            </a>

            <a 
              href="https://www.instagram.com/uia.photography?igsh=ZTNyOGhwcGtxZjhu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              aria-label="Instagram"
            >
              <img 
                src={instagramIcon} 
                alt="Instagram" 
                className="w-6 h-6"
              />
            </a>

            <a 
              href="https://www.tiktok.com/@unclefoms?_r=1&_t=ZS-92CLLUJE7bs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              aria-label="Twitter/X"
            >
              <img 
                src={xIcon} 
                alt="X" 
                className="w-6 h-6"
              />
            </a>
          </div>
        </div>

        {/* Desktop Layout - Logo, Quote (center), Icons */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <img 
              src={logo} 
              alt="UIA Photography" 
              className="h-14 w-auto"
            />
          </Link>

          <div className="text-center flex-grow">
            <p className="text-footer-dark font-dm-sans italic text-base lg:text-lg">
              "Photography is a love affair with life" - Burk Uzzle
            </p>
          </div>

          <div className="flex items-center space-x-5 flex-shrink-0">
            <a 
              href="mailto:uiaphotography@outlook.com" 
              className="hover:opacity-70 transition-opacity"
              aria-label="Email"
            >
              <img 
                src={emailIcon} 
                alt="Email" 
                className="w-6 h-6"
              />
            </a>

            <a 
              href="https://www.instagram.com/uia.photography?igsh=ZTNyOGhwcGtxZjhu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              aria-label="Instagram"
            >
              <img 
                src={instagramIcon} 
                alt="Instagram" 
                className="w-6 h-6"
              />
            </a>

            <a 
              href="https://www.tiktok.com/@unclefoms?_r=1&_t=ZS-92CLLUJE7bs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              aria-label="Twitter/X"
            >
              <img 
                src={xIcon} 
                alt="X" 
                className="w-6 h-6"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;