import React, { useState, useRef, useEffect } from 'react';
import { Eye, ExternalLink, X, Check } from 'lucide-react';

export default function AmenitiesSection({ isFullPage = false, onViewAll, onGetBookings }) {
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    if (selectedAmenity) {
      const timer = setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedAmenity]);

  const primaryAmenities = [
    {
      id: 1,
      title: "An Infinite-edge Pool",
      description: "Experience the joy of swimming in our infinity-edge pool that gives you a nice picturesque view.",
      longDescription: "Our signature infinite-edge pool seamlessly blends with the ocean horizon, offering an unparalleled swimming experience. Relax on premium sun loungers, enjoy signature cocktails from the swim-up bar, or watch the sunset over the coast.",
      highlights: ["Hours: 6:00 AM - 10:00 PM", "Complimentary poolside towels & refreshments", "Swim-up bar with signature cocktails"],
      image: "/images/amenity-pool.jpg"
    },
    {
      id: 2,
      title: "An Iconic Spa",
      description: "Set forth on an exquisite wellness journey to refresh, re-energize and rejuvenate at our iconic spa.",
      longDescription: "Escape to our world-class spa sanctuary, designed to restore balance to your body and mind. We offer bespoke therapies, custom facials, and traditional massages performed by certified wellness experts.",
      highlights: ["Hours: 9:00 AM - 8:00 PM", "Private steam and sauna rooms", "Complimentary herbal teas & aromatherapy"],
      image: "/images/amenity-spa.jpg"
    },
    {
      id: 3,
      title: "Luxurious Rooms",
      description: "Our rooms are more than just a place to stay. The relaxing ambience will keep you happy all through.",
      longDescription: "Every room and suite at Blue Moon is crafted with elegant design, modern automated features, and premium linens to ensure a restful stay. Enjoy panoramic views and 24/7 personal service.",
      highlights: ["Private balcony with sea/garden views", "Smart room control & high-speed WiFi", "24/7 personalized room service"],
      image: "/images/amenity-rooms.jpg"
    }
  ];

  const secondaryAmenities = [
    {
      id: 4,
      title: "Deep Soaking Bath-tub",
      description: "Take a dip into these special bath-tubs to soak into a refreshing vacation mode that you've wanted.",
      longDescription: "Unwind after a day of exploration in our deep, free-standing soaking bathtubs. Pair your bath with our curated selection of organic bath salts, essential oils, and plush bathrobes for the ultimate private spa experience.",
      highlights: ["Premium organic bath products", "Free-standing ergonomic design", "Complimentary bath salts & oils"],
      image: "/images/amenity-bath.jpg"
    },
    {
      id: 5,
      title: "Guest Computer & WiFi",
      description: "We offer special computers and WiFi for guests who'd like to stay connected while on vacation.",
      longDescription: "Stay connected with high-speed, secure Wi-Fi access throughout the resort. For work or urgent tasks, our modern business center is equipped with high-performance computers, printing facilities, and quiet workstations.",
      highlights: ["High-speed fiber internet coverage", "24/7 secure access business center", "Wireless printing & scanning facilities"],
      image: "/images/amenity-wifi.jpg"
    },
    {
      id: 6,
      title: "24 Hour Concierge",
      description: "We provide round-the-clock professional concierge service to assist you with reservations, transport, and personalized requests.",
      longDescription: "Our expert concierge team is dedicated to curating the perfect stay for you. From securing exclusive restaurant reservations and organizing private tours to coordinating airport transfers, we handle every detail.",
      highlights: ["24/7 round-the-clock availability", "Local activity & dining recommendations", "Airport transfer & chauffeur coordination"],
      image: "/images/amenity-concierge.jpg"
    }
  ];

  const perks = [
    {
      id: 1,
      title: "Ocean View Terrace",
      description: "Among the scenic beauty of the city we also have an ocean view terrace for every suite in our hotel.",
      longDescription: "Our sweeping ocean view terrace provides a stunning vantage point of the coast. It serves as a peaceful space for morning meditation, sunset photography, or relaxing with an evening cocktail under the stars.",
      highlights: ["Stunning panoramic ocean views", "Comfortable lounge seating & fire pits", "Perfect spot for sunset photography"],
      image: "/images/gallery-3.jpg"
    },
    {
      id: 2,
      title: "Delicious Food",
      description: "We have team chefs from across the world. So you can enjoy the delicacies anytime during your stay.",
      longDescription: "Embark on a culinary journey featuring a fusion of international flavors and fresh local catches. Guided by award-winning chefs, our restaurants offer diverse dining experiences, from beachside casual to candlelit fine dining.",
      highlights: ["Award-winning international chefs", "Fresh, locally sourced ingredients", "Beachfront dining & private beach picnics"],
      image: "/images/amenity-food.jpg"
    },
    {
      id: 3,
      title: "Private Beach",
      description: "Want to take a dip into the sea? All our guests get complimentary access to our private beach.",
      longDescription: "Step onto our exclusive, pristine stretch of private beach. Relax under shaded cabanas, stroll along the shore, or participate in complimentary water sports. Our beach attendants are ready to assist with towels and food service.",
      highlights: ["Complimentary private beach access", "Reserved sunbeds, umbrellas & cabanas", "Dedicated beachfront drink & food service"],
      image: "/images/amenity-beach.jpg"
    }
  ];

  const collageImages = [
    "/images/about-room.jpg",
    "/images/amenity-pool.jpg",
    "/images/hero-bg.jpg",
    "/images/amenity-rooms.jpg",
    "/images/amenity-bath.jpg",
    "/images/amenity-conference.jpg"
  ];

  const allAmenities = [...primaryAmenities, ...secondaryAmenities];

  const renderDetailsPanel = () => {
    if (!selectedAmenity) return null;
    return (
      <div 
        ref={detailsRef}
        className="mt-12 bg-resort-blue-50 border border-resort-blue-200 rounded-2xl overflow-hidden shadow-lg p-6 sm:p-8 animate-fade-in relative"
      >
        {/* Close Button top-right */}
        <button 
          onClick={() => setSelectedAmenity(null)}
          className="absolute top-4 right-4 text-resort-blue-950 hover:text-resort-gold-500 transition-colors z-20 bg-white/80 hover:bg-white shadow p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Image */}
          <div className="h-64 sm:h-80 w-full overflow-hidden rounded-xl shadow-md bg-gray-100">
            <img 
              src={selectedAmenity.image} 
              alt={selectedAmenity.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-resort-gold-500 text-xs font-sans tracking-[0.2em] font-bold block mb-2 uppercase">
                FEATURE DETAILS
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-resort-blue-950 mb-4 leading-tight">
                {selectedAmenity.title}
              </h3>
              <p className="text-gray-600 font-sans text-sm sm:text-base leading-relaxed mb-6">
                {selectedAmenity.longDescription || selectedAmenity.description}
              </p>

              {/* Highlights */}
              {selectedAmenity.highlights && selectedAmenity.highlights.length > 0 && (
                <div className="mb-6 bg-white p-5 rounded-lg border border-resort-blue-100 shadow-sm">
                  <h4 className="text-xs font-sans font-bold tracking-widest text-resort-blue-950 uppercase mb-3">
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {selectedAmenity.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start text-gray-700 text-sm font-sans">
                        <Check className="w-4 h-4 text-resort-gold-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedAmenity(null);
                  onGetBookings();
                }}
                className="px-8 py-3 bg-resort-blue-950 hover:bg-resort-gold-300 text-white hover:text-resort-blue-950 text-xs sm:text-sm font-sans font-bold tracking-widest transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer rounded"
              >
                BOOK THIS EXPERIENCE
              </button>
              <button
                onClick={() => setSelectedAmenity(null)}
                className="px-6 py-3 border border-gray-300 hover:border-resort-blue-950 text-gray-600 hover:text-resort-blue-950 text-xs sm:text-sm font-sans font-bold tracking-widest transition-all duration-200 cursor-pointer rounded bg-white"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isFullPage) {
    // HOME PAGE PREVIEW MODE
    return (
      <section className="py-20 md:py-24 bg-resort-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-3 uppercase">
                Premium Offerings
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950">
                Amenities &amp; Facilities
              </h2>
              <p className="text-gray-500 font-sans text-sm sm:text-base max-w-xl mt-3">
                If you are looking for a relaxing, refreshing and rejuvenating experience altogether, we offer all of that under one roof.
              </p>
            </div>
            <button 
              onClick={onViewAll}
              className="mt-6 md:mt-0 px-8 py-3 bg-resort-blue-950 text-white hover:bg-resort-gold-300 hover:text-resort-blue-950 text-xs sm:text-sm font-sans tracking-widest font-bold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              VIEW ALL
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {primaryAmenities.map((amenity) => (
              <div key={amenity.id} className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={amenity.image} 
                    alt={amenity.title} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-resort-blue-950/20 group-hover:bg-resort-blue-950/40 transition-colors duration-300"></div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-resort-blue-950 mb-3 group-hover:text-resort-gold-500 transition-colors">
                      {amenity.title}
                    </h3>
                    <p className="text-gray-500 font-sans text-sm leading-relaxed mb-6">
                      {amenity.description}
                    </p>
                  </div>
                  <button 
                    onClick={onViewAll}
                    className="text-xs font-sans tracking-widest font-bold text-resort-blue-950 group-hover:text-resort-gold-500 transition-colors uppercase border-b-2 border-resort-gold-300 pb-1 self-start inline-flex items-center space-x-1"
                  >
                    <span>Read More</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    );
  }

  // FULL AMENITIES TAB MODE
  return (
    <div className="animate-fade-in">
      {/* Hero Header Section */}
      <div className="relative h-[60vh] flex items-center justify-center bg-resort-blue-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ 
            backgroundImage: `url('/images/amenity-pool.jpg')` 
          }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="text-resort-gold-300 text-xs sm:text-sm font-sans tracking-[0.4em] font-bold block mb-4 uppercase">
            REJUVENATION &amp; LEISURE
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif text-white font-medium tracking-wide mb-6">
            Amenities &amp; Facilities
          </h1>
          <p className="text-white/90 font-sans text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
            We do not give you just rooms to stay. We give you an environment so you can experience the best while on a holiday with us. Walk into our hotel and enjoy a refreshing, rejuvenating, day-off with us.
          </p>
        </div>
      </div>

      {/* Main Amenities Grid (6 Items) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-3 uppercase">
                EXQUISITE SERVICES
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950">
                Core Hotel Amenities
              </h2>
            </div>
            <button 
              onClick={onGetBookings}
              className="mt-6 md:mt-0 px-8 py-3 bg-resort-blue-950 text-white hover:bg-resort-gold-300 hover:text-resort-blue-950 text-xs sm:text-sm font-sans tracking-widest font-bold transition-all duration-300 shadow-md"
            >
              GET BOOKINGS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allAmenities.map((amenity) => (
              <div key={amenity.id} className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                <div className="relative overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={amenity.image} 
                    alt={amenity.title} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-resort-blue-950/20 group-hover:bg-resort-blue-950/40 transition-colors duration-300"></div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-resort-blue-950 mb-3 group-hover:text-resort-gold-500 transition-colors">
                      {amenity.title}
                    </h3>
                    <p className="text-gray-500 font-sans text-sm leading-relaxed mb-6">
                      {amenity.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedAmenity(amenity)}
                    className="text-xs font-sans tracking-widest font-bold text-resort-blue-950 group-hover:text-resort-gold-500 transition-colors uppercase border-b-2 border-resort-gold-300 pb-1 self-start cursor-pointer"
                  >
                    READ MORE
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Inline details panel for Core Amenities */}
          {selectedAmenity && allAmenities.some(a => a.title === selectedAmenity.title) && renderDetailsPanel()}

        </div>
      </section>

      {/* Collage Gallery Grid */}
      <section className="py-16 bg-resort-blue-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-2 uppercase">VISUAL JOURNEY</span>
            <h2 className="text-3xl font-serif font-bold text-resort-blue-950">Resort Atmosphere</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {collageImages.map((img, idx) => {
              // Create dynamic col-spans to make it a collage
              const spanClass = idx === 0 ? "col-span-2 md:col-span-1" : idx === 3 ? "col-span-2" : "col-span-1";
              return (
                <div key={idx} className={`${spanClass} h-64 overflow-hidden rounded-lg shadow-md group relative`}>
                  <img src={img} alt={`Collage ${idx}`} className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-resort-blue-950/0 group-hover:bg-resort-blue-950/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other Perks Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-3 uppercase">
                MORE TO EXPLORE
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950">
                Other Perks &amp; Facilities
              </h2>
              <p className="text-gray-500 font-sans text-sm sm:text-base max-w-xl mt-3">
                Looking for more? Well, we believe that every guest walks into our hotel for the best experience. And, we are determined to do that.
              </p>
            </div>
            <button 
              onClick={onGetBookings}
              className="mt-6 md:mt-0 px-8 py-3 bg-resort-blue-950 text-white hover:bg-resort-gold-300 hover:text-resort-blue-950 text-xs sm:text-sm font-sans tracking-widest font-bold transition-all duration-300 shadow-md"
            >
              GET BOOKINGS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {perks.map((perk) => (
              <div key={perk.id} className="bg-resort-blue-50 rounded-lg overflow-hidden group border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="relative overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={perk.image} 
                    alt={perk.title} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-resort-blue-950/10 group-hover:bg-resort-blue-950/20 transition-colors"></div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-resort-blue-950 mb-3 group-hover:text-resort-gold-500 transition-colors">
                      {perk.title}
                    </h3>
                    <p className="text-gray-500 font-sans text-sm leading-relaxed mb-6">
                      {perk.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedAmenity(perk)}
                    className="text-xs font-sans tracking-widest font-bold text-resort-blue-950 group-hover:text-resort-gold-500 transition-colors uppercase border-b-2 border-resort-gold-300 pb-1 self-start cursor-pointer"
                  >
                    READ MORE
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Inline details panel for Perks */}
          {selectedAmenity && perks.some(p => p.title === selectedAmenity.title) && renderDetailsPanel()}

        </div>
      </section>
    </div>
  );
}
