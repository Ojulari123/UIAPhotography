import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';

function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  
  // Get payment status from URL params (Stripe redirects with these)
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    // Clear cart on successful payment
    if (redirectStatus === 'succeeded') {
      clearCart();
    }
  }, [redirectStatus, clearCart]);

  const isSuccess = redirectStatus === 'succeeded';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {isSuccess ? (
          <>
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 font-dm-sans mb-4">
              ORDER CONFIRMED!
            </h1>
            
            <p className="text-gray-600 font-dm-sans mb-2">
              Thank you for shopping with UIA Photography.
            </p>
            
            <p className="text-gray-600 font-dm-sans mb-8">
              A confirmation email has been sent to your email address with your order details.
            </p>

            <Link
              to="/products"
              className="inline-block bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base px-8 py-3 hover:bg-white hover:text-[#282C2D] transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </>
        ) : (
          <>
            {/* Error/Pending Icon */}
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-yellow-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 font-dm-sans mb-4">
              PAYMENT STATUS
            </h1>
            
            <p className="text-gray-600 font-dm-sans mb-8">
              {redirectStatus === 'failed' 
                ? 'Your payment was not successful. Please try again.'
                : 'Your payment is being processed. You will receive a confirmation email shortly.'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cart"
                className="inline-block bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base px-8 py-3 hover:bg-white hover:text-[#282C2D] transition-colors"
              >
                BACK TO CART
              </Link>
              <Link
                to="/"
                className="inline-block bg-white text-[#282C2D] border-2 border-[#282C2D] font-dm-sans text-base px-8 py-3 hover:bg-[#282C2D] hover:text-white transition-colors"
              >
                GO HOME
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;