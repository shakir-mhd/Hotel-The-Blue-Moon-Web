import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PricingSection({ targetRoomId, clearTargetRoomId, onSelectRoom }) {
  const [billingPeriod, setBillingPeriod] = useState('night'); // 'night' or 'day'

  useEffect(() => {
    if (targetRoomId) {
      // Small timeout to allow tab transition and DOM render
      const timer = setTimeout(() => {
        const element = document.getElementById(`pricing-${targetRoomId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight with a subtle golden glow border
          element.classList.add('ring-4', 'ring-resort-gold-400', 'ring-offset-2');
          
          const clearHighlight = setTimeout(() => {
            element.classList.remove('ring-4', 'ring-resort-gold-400', 'ring-offset-2');
            if (clearTargetRoomId) clearTargetRoomId();
          }, 3000);
          
          return () => clearTimeout(clearHighlight);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [targetRoomId, clearTargetRoomId]);

  const pricingData = [
    {
      id: "single",
      title: "Single Room",
      description: "Perfect for solo travelers seeking elegance and modern comforts.",
      image: "/images/room-single.jpg",
      prices: {
        night: 10000,
        day: 20000
      },
      perks: {
        night: [
          "Standard Check-in & Check-out",
          "Complimentary High-speed WiFi",
          "Access to Beach & Infinity Pool",
          "Welcome Drink upon Arrival"
        ],
        day: [
          "24-Hour Flexible Check-in/out",
          "Complimentary Gourmet Breakfast",
          "Access to Beach & Infinity Pool",
          "Mini Bar Refilled Daily",
          "10% Spa Treatment Discount"
        ]
      },
      badge: "Best Value"
    },
    {
      id: "double",
      title: "Double Room",
      description: "Designed for couples, blending vibrant decor with premium amenities.",
      image: "/images/room-double.jpg",
      prices: {
        night: 20000,
        day: 40000
      },
      perks: {
        night: [
          "Standard Check-in & Check-out",
          "Complimentary High-speed WiFi",
          "Access to Gym & Sea-view Deck",
          "Premium Tea & Coffee Setup"
        ],
        day: [
          "24-Hour Flexible Check-in/out",
          "Complimentary Breakfast & Dinner",
          "Access to Gym & Sea-view Deck",
          "Mini Bar Refilled Daily",
          "20% Spa & Massage Discount",
          "Priority Restaurant Booking"
        ]
      },
      badge: "Popular"
    },
    {
      id: "suite",
      title: "Suite Room",
      description: "A gorgeous luxury suite offering sweeping ocean views and supreme comfort.",
      image: "/images/room-suite.jpg",
      prices: {
        night: 50000,
        day: 80000
      },
      perks: {
        night: [
          "Panoramic Ocean-view Balcony",
          "Private Jacuzzi Bath",
          "24/7 Butler Service on Call",
          "Airport Pickup Service Included",
          "Access to VIP Executive Lounge"
        ],
        day: [
          "24-Hour Flexible Check-in/out",
          "All-inclusive Buffet (All Meals)",
          "Private Jacuzzi & Premium Spa Bath",
          "24/7 Dedicated Personal Butler",
          "Complimentary Luxury Airport Transfers",
          "Free Entry to Private Beach Club",
          "Champagne Bottle on Check-in"
        ]
      },
      badge: "Luxury Choice",
      featured: true
    },
    {
      id: "family",
      title: "Family Room",
      description: "Our signature expansive residency, allowing families to live like royalty.",
      image: "/images/room-family.jpg",
      prices: {
        night: 100000,
        day: 150000
      },
      perks: {
        night: [
          "Interconnecting Rooms & Living Area",
          "Full Kitchenette & Dining Table",
          "Kids Play Area & Club Access",
          "Direct Beach Walkout Access"
        ],
        day: [
          "24-Hour Flexible Check-in/out",
          "All-Inclusive Family Buffet Plan",
          "Dedicated Private Resort Concierge",
          "Private Beach Cabana Booking",
          "Round-trip Luxury Van Transfers",
          "Complimentary Laundry Service",
          "Private Beachside BBQ Setup"
        ]
      },
      badge: "Presidential"
    }
  ];

  return (
    <div className="animate-fade-in bg-resort-blue-50 min-h-screen">
      {/* Page Header */}
      <div className="relative h-[45vh] flex items-center justify-center bg-resort-blue-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ 
            backgroundImage: `url('/images/pricing-header.jpg')` 
          }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mt-12">
          <span className="text-resort-gold-300 text-xs sm:text-sm font-sans tracking-[0.4em] font-bold block mb-4 uppercase">
            Exclusive Rates
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium tracking-wide mb-4">
            Room Tariffs &amp; Stay Options
          </h1>
          <p className="text-white/80 font-sans text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Experience absolute transparent pricing with tailored packages. Choose between a cozy night stay or maximize your luxury with a flexible 24-hour full-day experience.
          </p>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Duration Toggle Container */}
          <div className="flex flex-col items-center mb-16">
            <span className="text-xs font-sans font-bold tracking-widest text-resort-gold-600 uppercase mb-4">
              Select Your Stay Duration
            </span>
            
            {/* Elegant Custom Sliding Tab Control */}
            <div className="relative bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-resort-gold-200/50 shadow-md flex items-center space-x-1 w-full max-w-[340px]">
              <div 
                className={`absolute top-1.5 bottom-1.5 left-1.5 bg-resort-blue-950 rounded-full transition-all duration-300 ease-out`}
                style={{
                  width: 'calc(50% - 6px)',
                  transform: billingPeriod === 'night' ? 'translateX(0%)' : 'translateX(100%)'
                }}
              />
              <button
                onClick={() => setBillingPeriod('night')}
                className={`w-1/2 text-center py-2.5 rounded-full text-xs font-sans font-bold tracking-wider relative z-10 transition-colors duration-300 ${
                  billingPeriod === 'night' ? 'text-resort-gold-300 font-semibold' : 'text-resort-blue-900/70 hover:text-resort-blue-950'
                }`}
              >
                ONE NIGHT
              </button>
              <button
                onClick={() => setBillingPeriod('day')}
                className={`w-1/2 text-center py-2.5 rounded-full text-xs font-sans font-bold tracking-wider relative z-10 transition-colors duration-300 ${
                  billingPeriod === 'day' ? 'text-resort-gold-300 font-semibold' : 'text-resort-blue-900/70 hover:text-resort-blue-950'
                }`}
              >
                FULL DAY (24H FLEX)
              </button>
            </div>
            
            <p className="text-xs text-gray-500 font-sans mt-4 max-w-md text-center leading-relaxed">
              {billingPeriod === 'night' 
                ? "Standard Stay: Check-in from 2:00 PM, Check-out by 11:00 AM standard resort hours."
                : "Ultimate Stay: Dynamic 24-hour cycle. Check out exactly 24 hours after your chosen check-in time."
              }
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {pricingData.map((room) => {
              const currentPrice = room.prices[billingPeriod];
              const formattedPrice = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              }).format(currentPrice);
              const roomPerks = room.perks[billingPeriod];

              return (
                <div 
                  key={room.id}
                  id={`pricing-${room.id}`}
                  className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border flex flex-col justify-between transform hover:-translate-y-2 relative group ${
                    room.featured 
                      ? 'border-resort-gold-400 ring-2 ring-resort-gold-300/30' 
                      : 'border-gray-100'
                  }`}
                >
                  {/* Badge */}
                  {room.badge && (
                    <span className={`absolute top-4 left-4 z-10 text-[10px] tracking-wider uppercase font-sans font-bold py-1 px-3.5 rounded-full shadow-md ${
                      room.featured
                        ? 'bg-resort-gold-500 text-white'
                        : 'bg-resort-blue-950 text-resort-gold-300'
                    }`}>
                      {room.badge}
                    </span>
                  )}

                  {/* Header Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={room.image} 
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                      <h3 className="text-xl sm:text-2xl font-serif text-white font-bold leading-tight drop-shadow-md">
                        {room.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description & Price Block */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Price Section */}
                      <div className="mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-serif font-bold text-resort-blue-950 tracking-tight transition-all duration-300 animate-scale-up">
                            {formattedPrice}
                          </span>
                        </div>
                        <span className="text-[10px] text-resort-gold-600 font-sans tracking-widest uppercase font-bold block mt-1">
                          Per {billingPeriod === 'night' ? 'Night' : 'Full Day'} Stay
                        </span>
                        <p className="text-xs text-gray-500 font-sans leading-relaxed mt-3">
                          {room.description}
                        </p>
                      </div>

                      {/* Perk List */}
                      <div className="space-y-3.5 mb-8">
                        <h4 className="text-[10px] font-sans font-bold tracking-widest text-resort-blue-950 uppercase">
                          What's Included
                        </h4>
                        <div className="space-y-2.5">
                          {roomPerks.map((perk, index) => (
                            <div key={index} className="flex items-start space-x-2.5">
                              <div className="bg-resort-gold-50 p-0.5 rounded-full mt-0.5 border border-resort-gold-200">
                                <Check className="w-3.5 h-3.5 text-resort-gold-600 stroke-[3]" />
                              </div>
                              <span className="text-xs text-gray-600 font-sans leading-tight">
                                {perk}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <button
                      onClick={() => onSelectRoom(room.id, billingPeriod)}
                      className={`w-full py-3.5 rounded font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2 border shadow-sm ${
                        room.featured
                          ? 'bg-resort-gold-500 hover:bg-resort-gold-400 text-white border-resort-gold-500 hover:border-resort-gold-400 hover:shadow-md'
                          : 'bg-resort-blue-950 hover:bg-resort-gold-300 text-white hover:text-resort-blue-950 border-resort-blue-950 hover:border-resort-gold-300'
                      }`}
                    >
                      <span>BOOK THIS ROOM</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Premium Stay Guarantee banner */}
          <div className="mt-20 glass-panel rounded-xl p-8 border border-resort-gold-300/30 shadow-md flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-resort-blue-950/10 p-3 rounded-full border border-resort-gold-300/20">
                <ShieldCheck className="w-8 h-8 text-resort-gold-600" />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-resort-blue-950">Best Rate Guarantee</h4>
                <p className="text-xs text-gray-500 font-sans mt-0.5 max-w-lg">
                  Booking directly with Hotel The Blue Moon guarantees the lowest possible room tariffs, flexible cancellation policies, and exclusive complimentary check-in upgrades.
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="text-center px-4 py-2 border-r border-gray-200">
                <span className="block text-xl font-serif font-bold text-resort-blue-950">No Fee</span>
                <span className="text-[10px] text-gray-400 font-sans uppercase">Booking Fee</span>
              </div>
              <div className="text-center px-4 py-2 border-r border-gray-200">
                <span className="block text-xl font-serif font-bold text-resort-blue-950">Free</span>
                <span className="text-[10px] text-gray-400 font-sans uppercase">High-Speed WiFi</span>
              </div>
              <div className="text-center px-4 py-2">
                <span className="block text-xl font-serif font-bold text-resort-blue-950">24/7</span>
                <span className="text-[10px] text-gray-400 font-sans uppercase">Support Access</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
