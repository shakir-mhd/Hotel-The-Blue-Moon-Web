import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "EMILY HUNT",
      role: "Leisure Traveler",
      avatar: "/images/avatar-1.jpg",
      content: "Proin nulla mauris et volutpat adipiscing suspendisse vehicula blandit sagittis orci etiam morbi elit etiam semper eu lacus pretium hac nisl leo amet ullamcorper."
    },
    {
      id: 2,
      name: "MORGAN JONATHAN",
      role: "Luxury Enthusiast",
      avatar: "/images/avatar-2.jpg",
      content: "Proin nulla mauris et volutpat adipiscing suspendisse vehicula blandit sagittis orci etiam morbi elit etiam semper eu lacus pretium hac nisl leo amet ullamcorper."
    },
    {
      id: 3,
      name: "JULIE ROBINSON",
      role: "Honeymooners",
      avatar: "/images/avatar-3.jpg",
      content: "Proin nulla mauris et volutpat adipiscing suspendisse vehicula blandit sagittis orci etiam morbi elit etiam semper eu lacus pretium hac nisl leo amet ullamcorper."
    },
    {
      id: 4,
      name: "JAMES BROOK",
      role: "Family Vacationer",
      avatar: "/images/avatar-4.jpg",
      content: "Proin nulla mauris et volutpat adipiscing suspendisse vehicula blandit sagittis orci etiam morbi elit etiam semper eu lacus pretium hac nisl leo amet ullamcorper."
    }
  ];

  return (
    <section className="py-20 md:py-24 bg-resort-blue-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.3em] font-bold block mb-3 uppercase">
            Guest Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950">
            What Our Guests Say
          </h2>
          <div className="w-16 h-0.5 bg-resort-gold-300 mx-auto mt-4"></div>
          <p className="text-gray-500 font-sans text-sm sm:text-base max-w-lg mx-auto mt-4">
            We take pride in serving our guests with the best experience. Read what they say.
          </p>
        </div>

        {/* Testimonials Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white p-8 rounded-xl shadow-md border border-gray-100/50 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
              
              {/* Star Rating & Content */}
              <div>
                {/* 4.5 Stars */}
                <div className="flex items-center space-x-1 mb-4 text-resort-gold-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <StarHalf className="w-4 h-4 fill-current" />
                </div>
                
                <p className="text-gray-600 font-sans text-sm sm:text-base italic leading-relaxed mb-6">
                  "{t.content}"
                </p>
              </div>

              {/* Guest Profile Details */}
              <div className="flex items-center space-x-4 border-t border-gray-50 pt-4">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-resort-gold-300/40" 
                />
                <div className="flex flex-col">
                  <span className="text-xs font-sans tracking-widest font-bold text-resort-blue-950 uppercase">
                    {t.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-sans font-medium">
                    {t.role}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
