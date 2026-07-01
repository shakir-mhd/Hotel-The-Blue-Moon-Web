import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import AmenitiesSection from './components/AmenitiesSection';
import RoomsGrid from './components/RoomsGrid';
import GallerySection from './components/GallerySection';
import Testimonials from './components/Testimonials';
import ContactPage from './components/ContactPage';
import BookingForm from './components/BookingForm';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import { X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStayType, setSelectedStayType] = useState('night');
  const [targetRoomId, setTargetRoomId] = useState(null);

  const handleOpenBooking = (roomId = null, stayType = 'night') => {
    setSelectedRoom(roomId);
    setSelectedStayType(stayType);
    setIsBookingOpen(true);
  };

  const handleNavigateToRoomPricing = (roomId) => {
    setTargetRoomId(roomId);
    setActiveTab('pricing');
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="relative min-h-screen bg-resort-blue-50 flex flex-col justify-between font-sans">
      {/* Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onBookNow={() => setActiveTab('pricing')} 
      />

      {/* Main Pages/Content Router */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            <Hero onBookNow={() => setActiveTab('pricing')} />
            <AboutSection onKnowMore={() => setActiveTab('rooms')} />
            <RoomsGrid 
              isFullPage={false} 
              onViewAll={() => setActiveTab('rooms')} 
              onSelectRoom={(roomId) => handleNavigateToRoomPricing(roomId)} 
            />
            <AmenitiesSection 
              isFullPage={false} 
              onViewAll={() => setActiveTab('amenities')} 
              onGetBookings={() => setActiveTab('pricing')} 
            />
            <GallerySection />
            <Testimonials />
          </div>
        )}

        {activeTab === 'rooms' && (
          <RoomsGrid 
            isFullPage={true} 
            onViewAll={() => {}} 
            onSelectRoom={(roomId) => handleNavigateToRoomPricing(roomId)} 
          />
        )}

        {activeTab === 'amenities' && (
          <AmenitiesSection 
            isFullPage={true} 
            onViewAll={() => {}} 
            onGetBookings={() => setActiveTab('pricing')} 
          />
        )}

        {activeTab === 'pricing' && (
          <PricingSection 
            targetRoomId={targetRoomId}
            clearTargetRoomId={() => setTargetRoomId(null)}
            onSelectRoom={(roomId, stayType) => handleOpenBooking(roomId, stayType)} 
          />
        )}

        {activeTab === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer 
        onBookNow={() => handleOpenBooking()} 
        activeTab={activeTab}
        setActiveTab={setActiveTab} 
      />

      {/* Booking Form Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Modal Backdrop closer */}
          <div className="absolute inset-0 cursor-pointer" onClick={handleCloseBooking}></div>
          
          {/* Modal Body Container */}
          <div className="relative w-full max-w-4xl z-10 max-h-[90vh] overflow-y-auto rounded-xl">
            {/* Close Button overlay */}
            <button 
              onClick={handleCloseBooking}
              className="absolute top-4 right-4 text-white hover:text-resort-gold-300 transition-colors z-20 bg-black/20 hover:bg-black/40 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <BookingForm 
              preselectedRoom={selectedRoom} 
              preselectedStayType={selectedStayType}
              onClose={handleCloseBooking} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
