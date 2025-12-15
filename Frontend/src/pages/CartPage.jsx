import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();

  const handleQuantityChange = (itemKey, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemKey, newQuantity);
    }
  };

  const handleRemoveItem = (itemKey) => {
    removeFromCart(itemKey);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Format product type for display (shortened)
  const formatProductType = (type) => {
    if (type === 'digital') return 'Digital';
    if (type === 'physical') return 'Physical';
    return type;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12">
        {/* Back to Store Link */}
        <Link
          to="/products"
          className="flex items-center gap-2 text-gray-900 font-dm-sans text-sm mb-6"
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

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-dm-sans mb-8">
          CART
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-dm-sans mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="text-gray-900 font-dm-sans"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Cart Table */}
            <div className="hidden md:block">
              {/* Table Header with horizontal line above */}
              <div className="border-t border-gray-300 pt-4">
                <div className="grid grid-cols-12 gap-6 mb-4 pb-4 border-b border-gray-300">
                  <div className="col-span-1"></div> {/* X button column */}
                  <div className="col-span-1"></div> {/* Image column */}
                  <div className="col-span-3 font-dm-sans text-sm font-medium text-gray-900">
                    TITLE
                  </div>
                  <div className="col-span-2 text-center font-dm-sans text-sm font-medium text-gray-900">
                    PRICE
                  </div>
                  <div className="col-span-2 font-dm-sans text-sm font-medium text-gray-900">
                    FORMAT
                  </div>
                  <div className="col-span-1 text-center font-dm-sans text-sm font-medium text-gray-900">
                    QUANTITY
                  </div>
                  <div className="col-span-2 text-right font-dm-sans text-sm font-medium text-gray-900">
                    SUBTOTAL
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-0">
                {cartItems.map((item) => (
                  <div
                    key={item.itemKey}
                    className="grid grid-cols-12 gap-6 items-center py-6 border-b border-gray-300"
                  >
                    {/* Remove Button */}
                    <div className="col-span-1">
                      <button
                        onClick={() => handleRemoveItem(item.itemKey)}
                        className="text-gray-900 hover:text-red-600 transition-colors"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Image */}
                    <div className="col-span-1">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>

                    {/* Product Title */}
                    <div className="col-span-3">
                      <p className="font-dm-sans text-base text-gray-900">
                        {item.title}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <p className="font-dm-sans text-base text-gray-900">
                        £{item.price}
                      </p>
                    </div>

                    {/* Product Type/Format */}
                    <div className="col-span-2">
                      <p className="font-dm-sans text-base text-gray-900">
                        {formatProductType(item.product_type)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="col-span-1 flex justify-center">
                      <div className="flex items-center border border-gray-900">
                        <button
                          onClick={() => handleQuantityChange(item.itemKey, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center border-r border-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className="text-lg">−</span>
                        </button>
                        <div className="w-12 h-10 flex items-center justify-center font-dm-sans">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => handleQuantityChange(item.itemKey, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center border-l border-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 text-right">
                      <p className="font-dm-sans text-base text-gray-900">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cart */}
            <div className="md:hidden space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.itemKey}
                  className="relative border-b border-gray-300 pb-6"
                >
                  {/* Remove Button - Top Right */}
                  <button
                    onClick={() => handleRemoveItem(item.itemKey)}
                    className="absolute top-0 right-0 text-gray-900 hover:text-red-600 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      {/* Title */}
                      <p className="font-dm-sans text-base text-gray-900 font-medium pr-6">
                        {item.title}
                      </p>

                      {/* Price */}
                      <p className="font-dm-sans text-base text-gray-900">
                        £{item.price}
                      </p>

                      {/* Product Type/Format */}
                      <p className="font-dm-sans text-sm text-gray-600">
                        {formatProductType(item.product_type)}
                      </p>

                      {/* Quantity Selector */}
                      <div className="flex items-center">
                        <div className="flex items-center border border-gray-900">
                          <button
                            onClick={() => handleQuantityChange(item.itemKey, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <span className="text-base">−</span>
                          </button>
                          <div className="w-10 h-8 flex items-center justify-center font-dm-sans text-sm">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => handleQuantityChange(item.itemKey, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-base">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <p className="font-dm-sans text-base text-gray-900 font-medium">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="mt-8 md:flex md:justify-between md:items-center">
              {/* Mobile: Total above button */}
              <div className="md:hidden mb-4">
                <p className="font-dm-sans text-xl font-bold text-gray-900">
                  £{getTotalPrice().toFixed(2)}
                </p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full md:w-auto bg-[#282C2D] text-white border-2 border-[#282C2D] font-dm-sans text-base py-4 px-8 md:px-12 hover:bg-white hover:text-[#282C2D] transition-colors"
              >
                PROCEED TO CHECKOUT
              </button>

              {/* Desktop: Total on right */}
              <div className="hidden md:block">
                <p className="font-dm-sans text-xl font-bold text-gray-900">
                  £{getTotalPrice().toFixed(2)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;