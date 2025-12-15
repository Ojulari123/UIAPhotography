import { useState } from 'react';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://formspree.io/f/mldqkgpw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          message: formData.message
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          topic: '',
          message: ''
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Contact Background */}
      <section className="relative w-full h-[40vh] md:h-[85vh] overflow-hidden">
        <img 
          src="/src/assets/contact.png" 
          alt="Contact" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white font-kyiv-serif tracking-wider">
            CONTACT
          </h1>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Form */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-dm-sans mb-8">
              GET IN TOUCH
            </h2>

            {/* Success Message */}
            {submitted ? (
              <div className="bg-white border border-black rounded p-6 text-center">
                <p className="text-black font-dm-sans text-lg font-medium mb-2">
                  Message sent successfully!
                </p>
                <p className="text-black font-dm-sans">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-black font-dm-sans hover-underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-white border border-red-200 rounded p-4">
                    <p className="text-red-600 font-dm-sans text-sm">{error}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="NAME"
                    className="w-full border border-[#282C2D] px-4 py-3 font-dm-sans text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#282C2D]"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="EMAIL"
                    className="w-full border border-[#282C2D] px-4 py-3 font-dm-sans text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#282C2D]"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Topic */}
                <div>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="TOPIC"
                    className="w-full border border-[#282C2D] px-4 py-3 font-dm-sans text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#282C2D]"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Message */}
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="MESSAGE"
                    rows="6"
                    className="w-full border border-[#282C2D] px-4 py-3 font-dm-sans text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#282C2D] resize-none"
                    required
                    disabled={submitting}
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#282C2D] text-white border-2 font-dm-sans text-base py-4 hover:bg-white hover:text-[#282C2D] border-[#282C2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'SENDING...' : 'SUBMIT'}
                </button>
              </form>
            )}
          </div>

          {/* Right Side - Image and Contact Info */}
          <div className="flex flex-col justify-between lg:min-h-[550px]">
            {/* Image - Hidden on mobile */}
            <div className="hidden lg:block rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src="/src/assets/theShot.png" 
                alt="Photographer"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '390px', objectFit: 'cover' }}
              />
            </div>

            {/* Contact Information */}
            <div className="flex-1 flex flex-col lg:justify-end">
              {/* Email */}
              <a 
                href="mailto:uiaphotography@outlook.com"
                className="flex items-center gap-3 py-4 hover:opacity-70 transition-opacity"
              >
                <img 
                  src="/src/assets/Email.svg" 
                  alt="Email" 
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="font-dm-sans text-gray-900 font-medium">uiaphotography@outlook.com</span>
              </a>

              {/* Horizontal Line */}
              <div className="border-t border-[#282C2D]"></div>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/uia.photography?igsh=ZTNyOGhwcGtxZjhu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-4 hover:opacity-70 transition-opacity"
              >
                <img 
                  src="/src/assets/Instagram.svg" 
                  alt="Instagram" 
                  className="w-6 h-6 flex-shrink-0"
                />
                <span className="font-dm-sans text-gray-900 font-medium">@uia.photography</span>
              </a>

              {/* Horizontal Line */}
              <div className="border-t border-[#282C2D]"></div>

              {/* Twitter/X */}
              <a 
                href="https://www.tiktok.com/@unclefoms?_r=1&_t=ZS-92CLLUJE7bs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-4 hover:opacity-70 transition-opacity"
              >
                <img 
                  src="/src/assets/X.svg" 
                  alt="X" 
                  className="w-6 h-6 flex-shrink-0"
                />
                <span className="font-dm-sans text-gray-900 font-medium">@unclefoms</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;