import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Hero({ onBookNow }) {
  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-resort-blue-950">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 animate-scale-up"
        style={{ 
          backgroundImage: `url('/images/hero-bg.jpg')` 
        }}
      >
        <div className="absolute inset-0 bg-hero-gradient"></div>
      </div>

      {/* Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 text-center z-10 select-none">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-medium text-white mb-6 tracking-wide drop-shadow-md animate-fade-in">
          Hotel The <span className="text-resort-gold-300">Blue Moon</span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-xl text-white/90 font-sans font-light max-w-2xl mx-auto mb-10 leading-relaxed tracking-wide drop-shadow animate-fade-in [animation-delay:200ms]">
          If you are looking for a perfect holiday experience with memories to cherish, you are at the right place. Let's plan a reasonable stay for you.
        </p>

        <div className="flex justify-center space-x-4 animate-fade-in [animation-delay:400ms]">
          <button 
            onClick={onBookNow}
            className="group px-8 py-3 bg-white text-resort-blue-950 text-xs sm:text-sm font-sans tracking-widest font-bold shadow-lg hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <span>BOOK YOUR STAY NOW</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 cursor-pointer z-10 animate-bounce">
        <span className="text-[10px] text-white/60 tracking-[0.3em] font-sans font-semibold">SCROLL DOWN</span>
        <div className="w-1 h-6 rounded-full bg-resort-gold-300/60 flex justify-center">
          <div className="w-1 h-2 bg-resort-gold-300 rounded-full animate-scroll"></div>
        </div>
      </div>
    </div>
  );
}
