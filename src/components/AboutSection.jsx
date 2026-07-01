import React from 'react';

export default function AboutSection({ onKnowMore }) {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Santorini Church Dome (Vertical Aspect) */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute inset-0 bg-resort-gold-300 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg"></div>
            <img 
              src="/images/about-spa.jpg" 
              alt="Santorini White Dome Church" 
              className="w-full h-[350px] sm:h-[500px] md:h-[600px] object-cover rounded-lg shadow-xl transform transition-transform duration-500 group-hover:scale-[1.01]" 
            />
            {/* Elegant overlay badge */}
            <div className="absolute bottom-6 left-6 bg-resort-blue-950 text-white p-6 shadow-2xl border-l-4 border-resort-gold-300 rounded-r-lg max-w-[220px]">
              <span className="text-resort-gold-300 font-serif text-3xl font-bold block mb-1">10+</span>
              <span className="text-[10px] tracking-widest font-sans font-semibold uppercase text-white/80">Years of Luxury Hospitality Experience</span>
            </div>
          </div>

          {/* Right Column: Title, descriptions, second image */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-3 uppercase">
                Welcome to Paradise
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-resort-blue-950 mb-6 leading-tight">
                Experience the Life of <br />
                <span className="text-resort-gold-500 italic">Hotel The Blue Moon</span>
              </h2>

              <p className="text-gray-600 font-sans text-sm sm:text-base leading-relaxed mb-6">
                We will help you experience the Blue Moon life in its true sense. From living among the residents to eating authentic delicacies you are sure to walk home with memories and wonderful moments.
              </p>

              <p className="text-gray-500 font-sans text-xs sm:text-sm leading-relaxed mb-8">
                Surrounded by scenic beauty and attractive tourist attractions we make it convenient for you to visit all the beautiful places with our inhouse guide. We can also help you arrange transport facilities for an easier commute to nearby places.
              </p>

              <button 
                onClick={onKnowMore}
                className="px-8 py-3 bg-resort-blue-950 text-white hover:bg-resort-gold-300 hover:text-resort-blue-950 text-xs sm:text-sm font-sans tracking-widest font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mb-10 lg:mb-12"
              >
                KNOW MORE
              </button>
            </div>

            {/* Cliffside terrace image underneath the text content */}
            <div className="relative group overflow-hidden rounded-lg shadow-xl">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500 z-10"></div>
              <img 
                src="/images/about-room.jpg" 
                alt="Santorini Cliffside Vista" 
                className="w-full h-[250px] sm:h-[300px] object-cover transform transition-transform duration-700 group-hover:scale-105" 
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
