import React, { useState, useEffect } from 'react';
import { Calendar, Users, Briefcase, Mail, Phone, CreditCard, ChevronRight, ChevronLeft, CheckCircle, Moon } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ROOM_TYPES = [
  { 
    id: 'single', 
    name: 'Single Room', 
    prices: { night: 10000, day: 20000 } 
  },
  { 
    id: 'double', 
    name: 'Double Room', 
    prices: { night: 20000, day: 40000 } 
  },
  { 
    id: 'suite', 
    name: 'Suite Room', 
    prices: { night: 50000, day: 80000 } 
  },
  { 
    id: 'family', 
    name: 'Family Room', 
    prices: { night: 100000, day: 150000 } 
  }
];

const formatRupees = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function BookingForm({ preselectedRoom, preselectedStayType = 'night', onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    roomType: preselectedRoom || 'single',
    stayType: preselectedStayType || 'night',
    adults: 1,
    children: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState({});
  const [totals, setTotals] = useState({ nights: 0, subtotal: 0, tax: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Update room type if preselected changes
  useEffect(() => {
    if (preselectedRoom) {
      setFormData(prev => ({ ...prev, roomType: preselectedRoom }));
    }
  }, [preselectedRoom]);

  // Update stay type if preselected stay type changes
  useEffect(() => {
    if (preselectedStayType) {
      setFormData(prev => ({ ...prev, stayType: preselectedStayType }));
    }
  }, [preselectedStayType]);

  // Recalculate totals
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const timeDiff = end.getTime() - start.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (nights > 0) {
        const selectedRoomObj = ROOM_TYPES.find(r => r.id === formData.roomType);
        const rate = selectedRoomObj ? selectedRoomObj.prices[formData.stayType] : 10000;
        const subtotal = rate * nights;
        const tax = Math.round(subtotal * 0.18); // 18% total tax & fees
        const total = subtotal + tax;
        
        setTotals({ nights, subtotal, tax, total });
      } else {
        setTotals({ nights: 0, subtotal: 0, tax: 0, total: 0 });
      }
    } else {
      setTotals({ nights: 0, subtotal: 0, tax: 0, total: 0 });
    }
  }, [formData.checkIn, formData.checkOut, formData.roomType, formData.stayType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    } else if (new Date(formData.checkIn) < today) {
      newErrors.checkIn = 'Check-in date cannot be in the past';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    } else if (formData.checkIn && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      newErrors.checkOut = 'Check-out must be after check-in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setIsSubmitting(true);
      setSubmissionError(null);
      try {
        await addDoc(collection(db, 'bookings'), {
          bookingReference: resRef,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          specialRequests: formData.specialRequests,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          roomType: formData.roomType,
          stayType: formData.stayType,
          adults: formData.adults,
          children: formData.children,
          nights: totals.nights,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          createdAt: serverTimestamp()
        });
        setStep(3);
      } catch (error) {
        console.error("Error writing document to Firestore: ", error);
        setSubmissionError("Failed to save booking. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Generate dynamic Reservation Reference
  const [resRef] = useState(`BMN-${Math.floor(100000 + Math.random() * 900000)}-2026`);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden animate-scale-up">
      {/* Progress Header */}
      {step < 3 && (
        <div className="bg-resort-blue-950 px-6 py-6 sm:px-10 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <Moon className="w-6 h-6 text-resort-gold-300 transform -rotate-12" />
            <span className="font-serif font-bold text-lg sm:text-xl tracking-wide">Hotel The Blue Moon Booking</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-sans tracking-widest text-white/60">
            <span className={step === 1 ? "text-resort-gold-300 font-bold" : "text-white/40"}>01 SELECT</span>
            <span className="text-white/20">|</span>
            <span className={step === 2 ? "text-resort-gold-300 font-bold" : "text-white/40"}>02 DETAILS</span>
            <span className="text-white/20">|</span>
            <span className="text-white/40">03 CONFIRM</span>
          </div>
        </div>
      )}

      {/* Step 1: Dates & Room Type */}
      {step === 1 && (
        <div className="p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-resort-blue-950 mb-8 border-b border-gray-100 pb-4">
            Select Dates &amp; Accommodation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Form Fields */}
            <div className="space-y-6">
              {/* Check In / Out dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Check-In</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" />
                    <input 
                      type="date" 
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                        errors.checkIn ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.checkIn && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.checkIn}</span>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Check-Out</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" />
                    <input 
                      type="date" 
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                        errors.checkOut ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.checkOut && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.checkOut}</span>}
                </div>
              </div>

              {/* Room Type & Stay Duration Option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Room Type</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" />
                    <select 
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded font-sans text-sm focus:outline-none focus:ring-1 focus:ring-resort-gold-300 appearance-none bg-white text-ellipsis overflow-hidden"
                    >
                      {ROOM_TYPES.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} ({formatRupees(room.prices.night)}/night | {formatRupees(room.prices.day)}/day)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Stay Duration Option</label>
                  <div className="relative">
                    <Moon className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" style={{ transform: 'rotate(-12deg)' }} />
                    <select 
                      name="stayType"
                      value={formData.stayType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded font-sans text-sm focus:outline-none focus:ring-1 focus:ring-resort-gold-300 appearance-none bg-white"
                    >
                      <option value="night">Standard Night Stay</option>
                      <option value="day">Full Day Stay (24H Flex)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guests (Adults & Children) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Adults</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" />
                    <select 
                      name="adults"
                      value={formData.adults}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded font-sans text-sm focus:outline-none focus:ring-1 focus:ring-resort-gold-300 appearance-none bg-white"
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults</option>
                      <option value={4}>4 Adults</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Children</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" />
                    <select 
                      name="children"
                      value={formData.children}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded font-sans text-sm focus:outline-none focus:ring-1 focus:ring-resort-gold-300 appearance-none bg-white"
                    >
                      <option value={0}>No Children</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                      <option value={3}>3 Children</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing Summary */}
            <div className="bg-resort-blue-50 p-6 rounded-lg border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-resort-blue-950 mb-4 border-b border-gray-200 pb-2">
                  Pricing Summary
                </h3>
                {totals.nights > 0 ? (
                  <div className="space-y-3 font-sans text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Room Rate:</span>
                      <span className="font-semibold">
                        {formatRupees(ROOM_TYPES.find(r => r.id === formData.roomType)?.prices[formData.stayType])} / {formData.stayType === 'night' ? 'night' : 'day'}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Stay Duration:</span>
                      <span className="font-semibold">
                        {totals.nights} {totals.nights === 1 ? (formData.stayType === 'night' ? 'night' : 'day') : (formData.stayType === 'night' ? 'nights' : 'days')}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 border-b border-dashed border-gray-200 pb-3">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatRupees(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxes &amp; Fees (18%):</span>
                      <span className="font-semibold">{formatRupees(totals.tax)}</span>
                    </div>
                    <div className="flex justify-between text-resort-blue-950 font-bold text-lg pt-2 border-t border-gray-200">
                      <span>Estimated Total:</span>
                      <span className="text-resort-gold-600">{formatRupees(totals.total)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 font-sans text-xs flex flex-col items-center justify-center">
                    <Calendar className="w-8 h-8 mb-2 opacity-50 text-resort-gold-500" />
                    <span>Please enter check-in and check-out dates to calculate rates.</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleNext}
                disabled={totals.nights <= 0}
                className={`w-full mt-6 py-3 font-sans text-xs tracking-widest font-bold uppercase rounded flex items-center justify-center space-x-2 transition-all ${
                  totals.nights > 0 
                    ? 'bg-resort-blue-950 text-white hover:bg-resort-gold-300 hover:text-resort-blue-950 shadow-md' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>CONTINUE TO DETAILS</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Guest Details */}
      {step === 2 && (
        <div className="p-6 sm:p-10 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-resort-blue-950 mb-8 border-b border-gray-100 pb-4">
            Guest Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Fields Column (Spans 2 columns) */}
            <div className="md:col-span-2 space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">First Name *</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={`w-full px-3 py-2 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                      errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.firstName && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.firstName}</span>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Last Name *</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={`w-full px-3 py-2 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                      errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.lastName && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.lastName}</span>}
                </div>
              </div>

              {/* Email / Phone fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. name@domain.com"
                      className={`w-full pl-10 pr-3 py-2 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.email && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.email}</span>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-resort-gold-500 absolute left-3 top-3" />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +94 77 123 4567"
                      className={`w-full pl-10 pr-3 py-2 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.phone && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.phone}</span>}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Special Requests &amp; Notes</label>
                <textarea 
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Tell us about bedding preferences, dietary restrictions, airport transport requests, etc."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300"
                ></textarea>
              </div>

              {submissionError && (
                <div className="text-red-500 text-xs font-sans mt-4 text-center bg-red-50 py-2.5 rounded border border-red-200">
                  {submissionError}
                </div>
              )}

              {/* Nav Buttons */}
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1 py-3 border border-resort-blue-950 text-resort-blue-950 hover:bg-resort-blue-50 font-sans text-xs tracking-widest font-bold uppercase rounded flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>
                <button 
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 bg-resort-blue-950 text-white hover:bg-resort-gold-300 hover:text-resort-blue-950 font-sans text-xs tracking-widest font-bold uppercase rounded flex items-center justify-center space-x-2 transition-all shadow-md ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{isSubmitting ? 'CONFIRMING...' : 'CONFIRM RESERVATION'}</span>
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar Summary Review Column */}
            <div className="bg-resort-blue-50 p-6 rounded-lg border border-gray-100 flex flex-col justify-between h-fit">
              <div>
                <h3 className="text-lg font-serif font-bold text-resort-blue-950 mb-4 border-b border-gray-200 pb-2">
                  Stay Details
                </h3>
                <div className="space-y-4 font-sans text-xs text-gray-600">
                  <div>
                    <span className="font-semibold block text-resort-blue-950 text-[10px] uppercase tracking-wider">Room Type</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {ROOM_TYPES.find(r => r.id === formData.roomType)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold block text-resort-blue-950 text-[10px] uppercase tracking-wider">Dates</span>
                    <span className="font-medium text-gray-700">
                      {formData.checkIn} to {formData.checkOut}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold block text-resort-blue-950 text-[10px] uppercase tracking-wider">Guests</span>
                    <span className="font-medium text-gray-700">
                      {formData.adults} {formData.adults === 1 ? 'Adult' : 'Adults'}
                      {formData.children > 0 && `, ${formData.children} ${formData.children === 1 ? 'Child' : 'Children'}`}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-resort-blue-950 font-bold text-sm">
                    <span>Est. Total:</span>
                    <span className="text-resort-gold-600 text-base">{formatRupees(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Screen */}
      {step === 3 && (
        <div className="p-8 sm:p-12 text-center animate-fade-in flex flex-col items-center justify-center">
          <CheckCircle className="w-20 h-20 text-emerald-500 mb-6 animate-bounce" />
          
          <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.4em] font-bold block mb-2 uppercase">
            RESERVATION CONFIRMED
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-resort-blue-950 mb-3">
            Thank you, {formData.firstName}!
          </h2>
          <p className="text-gray-500 font-sans text-sm max-w-md mx-auto mb-8">
            Your luxury booking has been received. We are preparing a wonderful Greek island resort getaway just for you.
          </p>

          {/* Reference Receipt */}
          <div className="w-full max-w-md bg-resort-blue-50 border border-gray-200 rounded-lg p-6 text-left font-sans text-xs space-y-3 mb-8 shadow-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2 mb-2">
              <span className="font-semibold text-resort-blue-950 uppercase tracking-wider">Booking Ref:</span>
              <span className="font-bold text-resort-blue-950 text-sm">{resRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Accommodation:</span>
              <span className="font-semibold text-gray-700">{ROOM_TYPES.find(r => r.id === formData.roomType)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dates:</span>
              <span className="font-semibold text-gray-700">{formData.checkIn} to {formData.checkOut} ({totals.nights} nights)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests:</span>
              <span className="font-semibold text-gray-700">{formData.adults} Adults {formData.children > 0 && `, ${formData.children} Children`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registered Email:</span>
              <span className="font-semibold text-gray-700">{formData.email}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 text-sm font-bold text-resort-blue-950">
              <span>Total Paid:</span>
              <span className="text-resort-gold-600">{formatRupees(totals.total)}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="px-10 py-3 bg-resort-blue-950 hover:bg-resort-gold-300 text-white hover:text-resort-blue-950 font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg rounded"
          >
            RETURN TO SITE
          </button>
        </div>
      )}
    </div>
  );
}
