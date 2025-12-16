import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePicOfWeekStore from '../stores/usePicOfWeekStore';
import Modal from '../components/Modal';

// Import images
import theHero from '../assets/theHero.png';
import twoOldFriends from '../assets/twoOldFriends.jpeg';
import walkingMirror from '../assets/walkingMirror.jpeg';
import theWomanInScarf from '../assets/theWomanInScarf.jpeg';
import theEye from '../assets/theEye.jpeg';
import theGaze from '../assets/theGaze.jpeg';
import theCut from '../assets/theCut.jpeg';
import inTheCrowd from '../assets/inTheCrowd.jpeg';
import gingerLady from '../assets/gingerLady.jpeg';
import theVixen from '../assets/theVixen.jpeg';
import fomsImg from '../assets/FomsImg.jpeg';

function HomePage() {
  const { pics, fetchAllPics, loading: picLoading } = usePicOfWeekStore();

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [poemModalOpen, setPoemModalOpen] = useState(false);
  const [selectedWorkImage, setSelectedWorkImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  
  useEffect(() => {
    fetchAllPics();
  }, [fetchAllPics]);

  // Get the most recent pic of the week (last one in the array)
  const latestPic = pics.length > 0 ? pics[pics.length - 1] : null;

  // Gallery images for modal
  const galleryImages = [
    { id: 1, src: twoOldFriends, alt: 'Two Old Friends' },
    { id: 2, src: walkingMirror, alt: 'Walking Mirror' },
    { id: 3, src: theWomanInScarf, alt: 'The Woman In Scarf' },
    { id: 4, src: theEye, alt: 'The Eye' },
  ];

  const handleGalleryImageClick = (index) => {
    setSelectedGalleryImage(galleryImages[index]);
    setCurrentGalleryIndex(index);
  };

  const handleNextGalleryImage = () => {
    const nextIndex = (currentGalleryIndex + 1) % galleryImages.length;
    setSelectedGalleryImage(galleryImages[nextIndex]);
    setCurrentGalleryIndex(nextIndex);
  };

  const handlePrevGalleryImage = () => {
    const prevIndex = currentGalleryIndex === 0 ? galleryImages.length - 1 : currentGalleryIndex - 1;
    setSelectedGalleryImage(galleryImages[prevIndex]);
    setCurrentGalleryIndex(prevIndex);
  };

  // My Work images
  const workImages = [
    { id: 1, src: theGaze, alt: 'The Gaze' },
    { id: 2, src: theCut, alt: 'The Cut' },
    { id: 3, src: inTheCrowd, alt: 'In The Crowd' },
    { id: 4, src: gingerLady, alt: 'Ginger Lady' },
    { id: 5, src: theVixen, alt: 'The Vixen' },
  ];

  const handleWorkImageClick = (index) => {
    setSelectedWorkImage(workImages[index]);
    setCurrentImageIndex(index);
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % workImages.length;
    setSelectedWorkImage(workImages[nextIndex]);
    setCurrentImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = currentImageIndex === 0 ? workImages.length - 1 : currentImageIndex - 1;
    setSelectedWorkImage(workImages[prevIndex]);
    setCurrentImageIndex(prevIndex);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] md:h-[60vh] lg:h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${theHero})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <h1 className="font-kyiv-serif font-medium text-white text-2xl sm:text-3xl md:text-5xl lg:text-7xl xl:text-8xl tracking-wider text-center whitespace-nowrap">
            U.I.A PHOTOGRAPHY
          </h1>
        </div>
      </section>

      {/* Masonry Gallery Section */}
      <section className="bg-[#D9D9D9] bg-opacity-50 rounded-b-[20px] py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {/* Left Column */}
              <div className="space-y-3">
                {/* Two Old Friends */}
                <div
                  className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleGalleryImageClick(0)}
                >
                  <img
                    src={twoOldFriends}
                    alt="Two Old Friends"
                    className="w-full h-40 object-cover"
                  />
                </div>
                {/* Walking Mirror */}
                <div
                  className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleGalleryImageClick(1)}
                >
                  <img
                    src={walkingMirror}
                    alt="Walking Mirror"
                    className="w-full h-40 object-cover"
                  />
                </div>
              </div>

              {/* Right Column - Woman In Scarf (spans full height) */}
              <div
                className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleGalleryImageClick(2)}
              >
                <img
                  src={theWomanInScarf}
                  alt="The Woman In Scarf"
                  className="w-full h-full object-cover"
                  style={{ height: 'calc(320px + 0.75rem)' }}
                />
              </div>
            </div>

            {/* The Eye - Full width below */}
            <div
              className="rounded-lg overflow-hidden mt-3 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleGalleryImageClick(3)}
            >
              <img
                src={theEye}
                alt="The Eye"
                className="w-full h-48 object-cover"
              />
            </div>

            {/* Text at bottom on mobile */}
            <div className="text-gray-900 font-dm-sans mt-6">
              <p className="text-base leading-relaxed">
                Photography is the immortalising of moments, turning brief experiences into memories that last. It's the capturing of emotion, from the seemingly mundane parts of life, to the tailored moments that are told as stories between loved ones. It's a curation of perspective, a channeling of creativity and the evidence of seeing what everyone else is dependent on you to see.
              </p>
            </div>
          </div>

          {/* Desktop Layout - 3 columns */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <div className="flex flex-col">
              <div
                className="rounded-lg overflow-hidden mb-6 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleGalleryImageClick(3)}
              >
                <img
                  src={theEye}
                  alt="The Eye"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="text-gray-900 font-dm-sans">
                <p className="text-base leading-relaxed">
                  Photography is the immortalising of moments, turning brief experiences into memories that last. It's the capturing of emotion, from the seemingly mundane parts of life, to the tailored moments that are told as stories between loved ones. It's a curation of perspective, a channeling of creativity and the evidence of seeing what everyone else is dependent on you to see.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 h-full">
              <div
                className="rounded-lg overflow-hidden flex-[4] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleGalleryImageClick(0)}
              >
                <img
                  src={twoOldFriends}
                  alt="Two Old Friends"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="rounded-lg overflow-hidden flex-[6] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleGalleryImageClick(1)}
              >
                <img
                  src={walkingMirror}
                  alt="Walking Mirror"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div
              className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleGalleryImageClick(2)}
            >
              <img
                src={theWomanInScarf}
                alt="The Woman In Scarf"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Image Modal */}
      <Modal
        isOpen={selectedGalleryImage !== null}
        onClose={() => setSelectedGalleryImage(null)}
        showNavigation={true}
        onNext={handleNextGalleryImage}
        onPrev={handlePrevGalleryImage}
      >
        {selectedGalleryImage && (
          <img
            src={selectedGalleryImage.src}
            alt={selectedGalleryImage.alt}
            className="max-h-[85vh] w-auto object-contain"
          />
        )}
      </Modal>

      {/* About Me Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-4xl font-medium text-gray-900 mb-6 font-dm-sans">
          ABOUT ME
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Image - Shows first on mobile, second on desktop */}
          <div className="rounded-lg overflow-hidden md:order-2">
            <img
              src={fomsImg}
              alt="About Me"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Text - Shows second on mobile, first on desktop */}
          <div className="md:order-1">
            <div className="space-y-4 text-gray-900 font-dm-sans">
              <p className="text-base leading-relaxed">
                Ufuomaoghene Akpokiniovo is an editorial and lifestyle photographer, passionate about
                capturing the beauty in everyday life that easily fades into the background of people's lives, and the expression of emotion and creativity hidden in the most simple of moments.
              </p>
              <p className="text-base leading-relaxed">
                He is an emerging photographer, approaching photography as an avenue to slow down, observe and create images as lenses for people to see life through.
              </p>
              <p className="text-base leading-relaxed">
                Building toward a full-time practice, he is focused and intentional on transitioning from photography as a creative outlet to working with individuals and brands across the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Picture & Poem of the Week Section */}
      <section className="bg-[#D9D9D9] bg-opacity-50 py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-4xl font-medium text-gray-900 mb-8 font-dm-sans">
            PICTURE & POEM OF THE WEEK
          </h2>

          {picLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : latestPic ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image - First on mobile, maintains position on desktop */}
              <div
                className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setImageModalOpen(true)}
              >
                <img
                  src={latestPic.image_url}
                  alt="Picture of the Week"
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '500px' }}
                />
              </div>

              {/* Poem - Second on mobile, maintains position on desktop */}
              <div
                className="bg-white rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                onClick={() => setPoemModalOpen(true)}
                style={{ maxHeight: '500px' }}
              >
                {/* Just the poem text, no title or author */}
                <div className="text-gray-900 font-dm-sans whitespace-pre-line text-center leading-relaxed">
                  {latestPic.poem}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No picture of the week available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal - Full image display, no scrolling */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      >
        {latestPic && (
          <img
            src={latestPic.image_url}
            alt="Picture of the Week - Full Size"
            className="max-h-[85vh] w-auto object-contain"
          />
        )}
      </Modal>

      {/* Poem Modal - With white background */}
      <Modal isOpen={poemModalOpen} onClose={() => setPoemModalOpen(false)}>
        {latestPic && (
          <div className="bg-white rounded-lg p-6 sm:p-10 max-w-4xl max-h-[85vh] overflow-y-auto">
            {/* Image at top on mobile */}
            <div className="mb-6 rounded-lg overflow-hidden md:hidden">
              <img
                src={latestPic.image_url}
                alt="Picture of the Week"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Full poem text */}
            <div className="text-gray-900 font-dm-sans whitespace-pre-line text-center text-base sm:text-lg leading-relaxed">
              {latestPic.poem}
            </div>
          </div>
        )}
      </Modal>

      {/* My Work Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-4xl font-medium text-gray-900 font-dm-sans">
            MY WORK
          </h2>
          <Link
            to="/portfolio"
            className="text-footer-dark font-dm-sans font-medium"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {/* Top Left - The Vixen (tall, spans 2 rows) */}
          <div
            className="row-span-2 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ height: 'calc(384px + 0.75rem)' }}
            onClick={() => handleWorkImageClick(4)}
          >
            <img
              src={workImages[4].src}
              alt={workImages[4].alt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top Right - The Cut */}
          <div
            className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity h-48"
            onClick={() => handleWorkImageClick(1)}
          >
            <img
              src={workImages[1].src}
              alt={workImages[1].alt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Right - In The Crowd */}
          <div
            className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity h-48"
            onClick={() => handleWorkImageClick(2)}
          >
            <img
              src={workImages[2].src}
              alt={workImages[2].alt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom - Ginger Lady (spans full width) */}
          <div
            className="col-span-2 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity h-48"
            onClick={() => handleWorkImageClick(3)}
          >
            <img
              src={workImages[3].src}
              alt={workImages[3].alt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Desktop Layout - Grid Layout */}
        <div className="hidden md:grid grid-cols-12 gap-4">
          {/* First Image - Left side, spans full height */}
          <div
            className="col-span-3 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ height: '600px' }}
            onClick={() => handleWorkImageClick(0)}
          >
            <img
              src={workImages[0].src}
              alt={workImages[0].alt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Column - Contains 2 images on top, 1 on bottom */}
          <div className="col-span-6 flex flex-col gap-3" style={{ height: '600px' }}>
            {/* Top Row - Two images side by side */}
            <div className="flex gap-3 flex-[1]">
              {/* Second Image */}
              <div
                className="flex-1 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleWorkImageClick(1)}
              >
                <img
                  src={workImages[1].src}
                  alt={workImages[1].alt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Third Image */}
              <div
                className="flex-1 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleWorkImageClick(2)}
              >
                <img
                  src={workImages[2].src}
                  alt={workImages[2].alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Fourth Image - Bottom, spans full width */}
            <div
              className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex-[1]"
              onClick={() => handleWorkImageClick(3)}
            >
              <img
                src={workImages[3].src}
                alt={workImages[3].alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Fifth Image - Right side, spans full height */}
          <div
            className="col-span-3 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ height: '600px' }}
            onClick={() => handleWorkImageClick(4)}
          >
            <img
              src={workImages[4].src}
              alt={workImages[4].alt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Work Image Modal */}
      <Modal
        isOpen={selectedWorkImage !== null}
        onClose={() => setSelectedWorkImage(null)}
        showNavigation={true}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      >
        {selectedWorkImage && (
          <img
            src={selectedWorkImage.src}
            alt={selectedWorkImage.alt}
            className="max-h-[85vh] w-auto object-contain"
          />
        )}
      </Modal>
    </div>
  );
}

export default HomePage;