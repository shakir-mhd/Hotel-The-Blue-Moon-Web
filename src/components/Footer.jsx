import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Compass = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer({ onBookNow, activeTab, setActiveTab }) {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-100 font-sans">
      
      {/* Bottom Visual Banner CTA (Santorini Coastal Town Overlay) */}
      <div className="relative py-24 sm:py-28 overflow-hidden bg-resort-blue-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-102"
          style={{ 
            backgroundImage: `url('/images/about-room.jpg')` 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-resort-blue-950 via-resort-blue-950/60 to-resort-blue-950/30"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center z-10 text-white">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4 tracking-wide leading-tight">
            Plan an Unforgettable Experience in <br />
            <span className="text-resort-gold-300">Blue Moon Hotel !</span>
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-10 font-light">
            We can help you fit your stay and experience within your allotted budget.
          </p>

          <span className="text-[10px] text-resort-gold-300 tracking-[0.4em] font-bold block mb-6 uppercase">
            BOOK YOUR STAY NOW
          </span>

          {/* Social Overlays Contacts */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 mb-8">
            <a 
              href="tel:+94717224755" 
              className="flex items-center space-x-3 text-lg sm:text-2xl font-bold tracking-wide hover:text-resort-gold-300 transition-colors"
            >
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-resort-gold-300" />
              <span>+94 717 224 755</span>
            </a>
            
            <a 
              href="#" 
              className="flex items-center space-x-3 text-lg sm:text-2xl font-bold tracking-wide hover:text-resort-gold-300 transition-colors"
            >
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-resort-gold-300" />
              <span>Shakir Mohomed</span>
            </a>

            <a 
              href="#" 
              className="flex items-center space-x-3 text-lg sm:text-2xl font-bold tracking-wide hover:text-resort-gold-300 transition-colors"
            >
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-resort-gold-300" />
              <span>Shakir_skr_</span>
            </a>
          </div>

          <button 
            onClick={onBookNow}
            className="px-10 py-3 bg-white text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-xl"
          >
            RESERVE A ROOM
          </button>
        </div>
      </div>

      {/* Footer Columns (Link Directories) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-sm">
          
          {/* Column 1: Brand Info */}
          <div>
            <h3 className="text-resort-blue-950 font-serif font-bold text-lg mb-4">
              Travel &amp; Tourism
            </h3>
            <p className="text-gray-500 leading-relaxed font-light">
              Experience absolute coastal elegance at Hotel The Blue Moon. Nestled on the pristine sandy shores of Unawatuna, we offer bespoke seaside sanctuaries, fine global cuisine, and world-class spa wellness tailored for your ultimate relaxation.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-resort-blue-950 font-serif font-bold text-lg mb-4">
              Hotel
            </h3>
            <ul className="space-y-2">
              {['home', 'rooms', 'pricing', 'amenities', 'contact'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => handleNavClick(item)}
                    className="text-gray-500 hover:text-resort-gold-500 hover:pl-1 transition-all duration-200 uppercase text-xs tracking-wider font-semibold"
                  >
                    {item === 'home' ? 'About Us' : item === 'pricing' ? 'Rates & Tariffs' : item}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={onBookNow} className="text-gray-500 hover:text-resort-gold-500 hover:pl-1 transition-all duration-200 uppercase text-xs tracking-wider font-semibold">
                  Bookings
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="text-resort-blue-950 font-serif font-bold text-lg mb-4">
              Customer Help
            </h3>
            <ul className="space-y-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <li className="hover:text-resort-gold-500 cursor-pointer transition-colors">Guest Support</li>
              <li className="hover:text-resort-gold-500 cursor-pointer transition-colors">Guest Feedback</li>
              <li className="hover:text-resort-gold-500 cursor-pointer transition-colors">FAQs</li>
              <li className="hover:text-resort-gold-500 cursor-pointer transition-colors">Offers</li>
              <li onClick={() => handleNavClick('contact')} className="hover:text-resort-gold-500 cursor-pointer transition-colors">Location</li>
            </ul>
          </div>

          {/* Column 4: Contact Details */}
          <div>
            <h3 className="text-resort-blue-950 font-serif font-bold text-lg mb-4">
              Contact Us
            </h3>
            <div className="space-y-4 text-gray-500 font-light leading-relaxed">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-resort-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-resort-blue-950 text-xs">Reception Office</span>
                  <span className="text-xs">2855 Beach Side Rd, Unawatuna, Galle, Sri Lanka</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-resort-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-resort-blue-950 text-xs">Call Us</span>
                  <span className="text-xs">+94 717 224 755</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-resort-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-resort-blue-950 text-xs">Email</span>
                  <span className="text-xs">shakirvta01@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-4 mt-6">
              <a href="#" className="p-2 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                <Compass className="w-4 h-4" /> {/* TripAdvisor placeholder */}
              </a>
              <a href="#" className="p-2 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <span>Copyright &copy; 2026 Hotel The Blue Moon | All Rights Reserved</span>
          <span className="mt-2 md:mt-0">Powered by Mohomed Shakir</span>
        </div>
      </div>

    </footer>
  );
}
