import React from 'react';
import { Bed, Users, Maximize, Check } from 'lucide-react';

export default function RoomsGrid({ isFullPage = false, onViewAll, onSelectRoom }) {
  const rooms = [
    {
      id: "single",
      title: "Single Room",
      price: "₹10,000",
      size: "28 m²",
      capacity: "1 Guest",
      bed: "1 Single Bed",
      description: "Our single rooms are complemented with modern and luxurious amenities for a wonderful stay.",
      image: "/images/room-single.jpg",
      features: ["Complimentary WiFi", "Ocean View Balcony", "Mini Bar", "Air Conditioning"]
    },
    {
      id: "double",
      title: "Double Room",
      price: "₹20,000",
      size: "38 m²",
      capacity: "2 Guests",
      bed: "1 King Bed",
      description: "We offer double rooms designed with a vibrant touch to enhance your spirits for a happening holiday.",
      image: "/images/room-double.jpg",
      features: ["Complimentary WiFi", "Private Balcony", "Espresso Machine", "Lounge Area"]
    },
    {
      id: "suite",
      title: "Suite Room",
      price: "₹50,000",
      size: "54 m²",
      capacity: "2 Guests",
      bed: "1 Super King Bed",
      description: "This is the second-highest ranked room in our hotel that offers luxury with the most advanced amenities.",
      image: "/images/room-suite.jpg",
      features: ["Panoramic Sea Views", "Private Jacuzzi", "Separate Living Space", "Butler Service"]
    },
    {
      id: "family",
      title: "Family Room",
      price: "₹1,00,000",
      size: "72 m²",
      capacity: "4 Guests",
      bed: "2 Queen Beds",
      description: "Wish to live like a king? Here's the top family rooms where you can spend the best days of your life with your family.",
      image: "/images/room-family.jpg",
      features: ["Interconnecting Rooms", "Kitchenette", "Kids Play Area Access", "Direct Beach Access"]
    }
  ];

  if (!isFullPage) {
    // HOME PAGE PREVIEW MODE (Show first 2 rooms side-by-side)
    return (
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-3 uppercase">
                Luxury Stays
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950">
                Come &amp; Stay With Us
              </h2>
              <p className="text-gray-500 font-sans text-sm sm:text-base max-w-xl mt-3">
                Pick any of our hotel rooms to experience the delightful decor, complemented with modern amenities for a comfortable stay.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {rooms.slice(0, 2).map((room) => (
              <div key={room.id} className="bg-resort-blue-50 rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                <div className="relative overflow-hidden h-72 sm:h-96">
                  <img 
                    src={room.image} 
                    alt={room.title} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Price badge removed */}
                </div>
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-resort-blue-950 mb-3 group-hover:text-resort-gold-500 transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-gray-500 font-sans text-sm leading-relaxed mb-6">
                      {room.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => onSelectRoom(room.id)}
                    className="text-xs font-sans tracking-widest font-bold text-resort-blue-950 group-hover:text-resort-gold-500 transition-colors uppercase border-b-2 border-resort-gold-300 pb-1 self-start"
                  >
                    VIEW TARIFFS & STAY OPTIONS
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    );
  }

  // FULL ROOMS TAB MODE
  return (
    <div className="animate-fade-in">
      {/* Hero Header Section */}
      <div className="relative h-[60vh] flex items-center justify-center bg-resort-blue-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ 
            backgroundImage: `url('/images/about-room.jpg')` 
          }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="text-resort-gold-300 text-xs sm:text-sm font-sans tracking-[0.4em] font-bold block mb-4 uppercase">
            ACCOMMODATION OPTIONS
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif text-white font-medium tracking-wide mb-6">
            Rooms &amp; Accommodation
          </h1>
          <p className="text-white/90 font-sans text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
            If you are looking for a home away from home, just walk in here. You can get both, an incredible and relaxing experience while you are on a holiday. Take a closer look into the rooms we offer and pick the one for you.
          </p>
        </div>
      </div>

      {/* Rooms Showcase Grid */}
      <section className="py-20 bg-resort-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-2 uppercase">SELECT YOUR STAY</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950">Come &amp; Stay With Us</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
                {/* Image & Price */}
                <div className="relative overflow-hidden h-72 sm:h-96">
                  <img 
                    src={room.image} 
                    alt={room.title} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-102 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-resort-blue-950/10 group-hover:bg-resort-blue-950/30 transition-all duration-300"></div>
                </div>

                {/* Info Content */}
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-resort-blue-950 mb-3 group-hover:text-resort-gold-500 transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-gray-500 font-sans text-sm leading-relaxed mb-6">
                      {room.description}
                    </p>

                    {/* Specifications */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-6">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Users className="w-5 h-5 text-resort-gold-500 mb-1" />
                        <span className="text-[10px] text-gray-400 font-sans uppercase">Capacity</span>
                        <span className="text-xs text-resort-blue-950 font-bold font-sans mt-0.5">{room.capacity}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center border-x border-gray-100">
                        <Maximize className="w-5 h-5 text-resort-gold-500 mb-1" />
                        <span className="text-[10px] text-gray-400 font-sans uppercase">Size</span>
                        <span className="text-xs text-resort-blue-950 font-bold font-sans mt-0.5">{room.size}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center">
                        <Bed className="w-5 h-5 text-resort-gold-500 mb-1" />
                        <span className="text-[10px] text-gray-400 font-sans uppercase">Bed Type</span>
                        <span className="text-xs text-resort-blue-950 font-bold font-sans mt-0.5">{room.bed}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mb-8">
                      <h4 className="text-xs font-sans font-bold tracking-widest text-resort-blue-950 uppercase mb-3">Room Highlights</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {room.features.map((feat, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-resort-gold-500" />
                            <span className="text-xs text-gray-600 font-sans">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA Book Button */}
                  <button 
                    onClick={() => onSelectRoom(room.id)}
                    className="w-full py-3 bg-resort-blue-950 hover:bg-resort-gold-300 text-white hover:text-resort-blue-950 font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg rounded"
                  >
                    VIEW TARIFFS & STAY OPTIONS
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
