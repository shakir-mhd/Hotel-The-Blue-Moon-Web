import React, { useState } from 'react';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GallerySection() {
  const [selectedImgIdx, setSelectedImgIdx] = useState(null);

  const images = [
    {
      id: 0,
      src: "/images/gallery-1.jpg",
      alt: "Ocean View Loungers"
    },
    {
      id: 1,
      src: "/images/gallery-2.jpg",
      alt: "Resort Dining Table Close-up"
    },
    {
      id: 2,
      src: "/images/hero-bg.jpg",
      alt: "Santorini Terrace Dining"
    },
    {
      id: 3,
      src: "/images/room-single.jpg",
      alt: "Ocean View Master Suite"
    },
    {
      id: 4,
      src: "/images/gallery-3.jpg",
      alt: "Shade Sail Cliffside Terrace"
    },
    {
      id: 5,
      src: "/images/about-spa.jpg",
      alt: "Greek Church Blue Dome"
    }
  ];

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedImgIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedImgIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 md:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-3 uppercase">
            Captured Moments
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950">
            Our Inside Pictures
          </h2>
          <div className="w-16 h-0.5 bg-resort-gold-300 mx-auto mt-4"></div>
          <p className="text-gray-500 font-sans text-sm sm:text-base max-w-lg mx-auto mt-4">
            Take a look at some pretty pictures captured in and around our premises.
          </p>
        </div>

        {/* Gallery Grid Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Block (Collage: 2 small vertical stacked, 1 large vertical side-by-side) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Stacked Images 0 and 1 */}
            <div className="flex flex-col gap-6">
              {/* Image 0 */}
              <div 
                onClick={() => setSelectedImgIdx(0)}
                className="h-64 overflow-hidden rounded-lg shadow-md group relative cursor-pointer"
              >
                <img 
                  src={images[0].src} 
                  alt={images[0].alt} 
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>

              {/* Image 1 */}
              <div 
                onClick={() => setSelectedImgIdx(1)}
                className="h-64 overflow-hidden rounded-lg shadow-md group relative cursor-pointer"
              >
                <img 
                  src={images[1].src} 
                  alt={images[1].alt} 
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Column 2: Large Vertical Image 2 */}
            <div 
              onClick={() => setSelectedImgIdx(2)}
              className="h-[536px] hidden md:block overflow-hidden rounded-lg shadow-md group relative cursor-pointer"
            >
              <img 
                src={images[2].src} 
                alt={images[2].alt} 
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Eye className="w-8 h-8 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300" />
              </div>
            </div>
            
            {/* Mobile Fallback for Image 2 (so it renders cleanly on single-column mobile grid) */}
            <div 
              onClick={() => setSelectedImgIdx(2)}
              className="h-64 md:hidden overflow-hidden rounded-lg shadow-md group relative cursor-pointer"
            >
              <img 
                src={images[2].src} 
                alt={images[2].alt} 
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Eye className="w-8 h-8 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300" />
              </div>
            </div>

          </div>

          {/* Right Block (Collage: 1 large horizontal-ish, 2 stacked) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Stacked Images 4 and 5 */}
            <div className="grid grid-cols-2 gap-6">
              {/* Image 4 */}
              <div 
                onClick={() => setSelectedImgIdx(4)}
                className="h-[256px] overflow-hidden rounded-lg shadow-md group relative cursor-pointer"
              >
                <img 
                  src={images[4].src} 
                  alt={images[4].alt} 
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Image 5 */}
              <div 
                onClick={() => setSelectedImgIdx(5)}
                className="h-[256px] overflow-hidden rounded-lg shadow-md group relative cursor-pointer"
              >
                <img 
                  src={images[5].src} 
                  alt={images[5].alt} 
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Large horizontal image 3 */}
            <div 
              onClick={() => setSelectedImgIdx(3)}
              className="h-[256px] overflow-hidden rounded-lg shadow-md group relative cursor-pointer"
            >
              <img 
                src={images[3].src} 
                alt={images[3].alt} 
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Eye className="w-8 h-8 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImgIdx !== null && (
        <div 
          onClick={() => setSelectedImgIdx(null)}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        >
          <button 
            onClick={() => setSelectedImgIdx(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button 
            onClick={handlePrev}
            className="absolute left-6 text-white/80 hover:text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-5xl max-h-[85vh] relative flex flex-col items-center">
            <img 
              src={images[selectedImgIdx].src} 
              alt={images[selectedImgIdx].alt} 
              className="max-w-full max-h-[75vh] object-contain rounded shadow-2xl animate-scale-up" 
            />
            <p className="text-white/80 font-sans text-sm mt-4 tracking-wider">
              {images[selectedImgIdx].alt}
            </p>
          </div>

          <button 
            onClick={handleNext}
            className="absolute right-6 text-white/80 hover:text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </section>
  );
}
