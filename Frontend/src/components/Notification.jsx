import { useEffect } from 'react';

function Notification({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-white border-2 border-[#282C2D] rounded-2xl px-12 py-4 shadow-lg min-w-[300px]">
        <p className="font-dm-sans text-[#282C2D] text-center text-base font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Notification;