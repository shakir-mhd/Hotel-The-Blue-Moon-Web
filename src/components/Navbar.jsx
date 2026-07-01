import React, { useState, useEffect } from 'react';
import { Menu, X, Anchor, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onBookNow }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'rooms', label: 'ROOMS' },
    { id: 'pricing', label: 'PRICING' },
    { id: 'amenities', label: 'AMENITIES' },
    { id: 'contact', label: 'CONTACT' }
  ];

  const handleLinkClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-panel-dark shadow-lg py-3' 
          : 'bg-gradient-to-b from-black/60 to-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => handleLinkClick('home')}
            >
              <div className="relative">
                <Moon className="w-8 h-8 text-resort-gold-300 transform -rotate-12 transition-transform duration-500 group-hover:rotate-12" />
                <Anchor className="w-4 h-4 text-white absolute bottom-0 right-0 opacity-70" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide leading-none">
                  Hotel The Blue Moon
                </span>
                <span className="text-[9px] text-resort-gold-200 tracking-[0.25em] font-sans uppercase">
                  Luxury Beach Resort
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`text-xs font-sans tracking-widest font-semibold transition-all duration-200 relative py-1 hover:text-resort-gold-200 ${
                    activeTab === link.id ? 'text-resort-gold-300' : 'text-white'
                  }`}
                >
                  {link.label}
                  {activeTab === link.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-resort-gold-300 animate-scale-up" />
                  )}
                </button>
              ))}
            </div>

            {/* Reservation Button (Desktop) */}
            <div className="hidden md:block">
              <button 
                onClick={onBookNow}
                className="px-6 py-2 border-2 border-resort-gold-300 text-resort-gold-300 text-xs font-sans tracking-widest font-bold bg-transparent hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-all duration-300"
              >
                RESERVATION
              </button>
            </div>

            {/* Hamburger Menu (Mobile) */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-resort-gold-300 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/90 z-40 md:hidden flex flex-col justify-center items-center transition-all duration-300">
          <div className="flex flex-col space-y-8 text-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-xl font-serif tracking-widest transition-colors duration-200 ${
                  activeTab === link.id ? 'text-resort-gold-300 font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBookNow();
              }}
              className="mt-4 px-8 py-3 border border-resort-gold-300 text-resort-gold-300 text-sm tracking-widest font-bold bg-transparent hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-all duration-300"
            >
              RESERVATION
            </button>
          </div>
        </div>
      )}
    </>
  );
}
