import React, { useState } from 'react';
import { MapPin, Clock, Phone, Mail, Send, CheckCircle } from 'lucide-react';

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

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formState.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formState.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formState.subject.trim()) newErrors.subject = 'Subject is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="animate-fade-in font-sans">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center bg-resort-blue-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ 
            backgroundImage: `url('/images/hero-bg.jpg')` 
          }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="text-resort-gold-300 text-xs sm:text-sm font-sans tracking-[0.4em] font-bold block mb-4 uppercase">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif text-white font-medium tracking-wide mb-6">
            Contact Us
          </h1>
          <p className="text-white/90 font-sans text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
            Do you want to enquire about our pricing, current offers and arrangements we can help you with? Give us a call or send in your concerns through the form below.
          </p>
        </div>
      </div>

      {/* Main Details and Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
            
            {/* Left Column: Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-resort-gold-500 text-xs sm:text-sm font-sans tracking-[0.25em] font-bold block mb-2 uppercase">OFFICE DETAILS</span>
                <h2 className="text-3xl font-serif font-bold text-resort-blue-950">Reception Desk</h2>
                <div className="w-12 h-0.5 bg-resort-gold-300 mt-3"></div>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-resort-blue-50 rounded-lg text-resort-gold-500">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-resort-blue-950 text-base mb-1">Reception Office</h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-light">
                      2855 Beach Side Rd, Unawatuna,<br />Galle, Sri Lanka, 80000
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-resort-blue-50 rounded-lg text-resort-gold-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-resort-blue-950 text-base mb-1">Reception Hours</h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-semibold text-resort-blue-950">
                      7:30 AM - 11:00 PM
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-resort-blue-50 rounded-lg text-resort-gold-500">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-resort-blue-950 text-base mb-1">Direct Contacts</h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-light">
                      Phone: <span className="font-semibold text-gray-700">+94 717 224 755</span><br />
                      Email: <span className="font-semibold text-gray-700">shakirvta01@gmail.com</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4">
                <h4 className="font-sans font-bold text-resort-blue-950 text-xs tracking-widest uppercase mb-4">Follow Us</h4>
                <div className="flex items-center space-x-4">
                  <a href="#" className="p-3 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-3 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                    <Compass className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-3 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-3 rounded-full bg-resort-blue-50 text-resort-blue-950 hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-colors shadow-sm">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-resort-blue-50 p-8 sm:p-10 rounded-xl shadow-md border border-gray-100/50">
                {isSubmitted ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-2xl font-serif font-bold text-resort-blue-950 mb-2">Message Sent!</h3>
                    <p className="text-gray-500 text-sm max-w-sm mb-6">
                      Thank you for contacting us. Our reception desk team will review your enquiry and get back to you shortly.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 bg-resort-blue-950 text-white font-sans text-xs font-bold tracking-wider uppercase rounded hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-all"
                    >
                      SEND ANOTHER MESSAGE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Name *</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className={`w-full px-4 py-2.5 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        {errors.name && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.name}</span>}
                      </div>

                      <div>
                        <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Email *</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          placeholder="Your Email Address"
                          className={`w-full px-4 py-2.5 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        {errors.email && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.email}</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Subject *</label>
                      <input 
                        type="text" 
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        placeholder="Reservation, Event Query, Transport request, etc."
                        className={`w-full px-4 py-2.5 border rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300 ${
                          errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {errors.subject && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.subject}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold tracking-wider text-gray-500 uppercase mb-2">Message</label>
                      <textarea 
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Write your concerns here..."
                        rows={5}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded font-sans text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-resort-gold-300"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-resort-blue-950 text-white font-sans text-xs font-bold tracking-widest uppercase hover:bg-resort-gold-300 hover:text-resort-blue-950 transition-all rounded shadow-md flex items-center justify-center space-x-2"
                    >
                      <span>SUBMIT</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Styled Simulated Google Map */}
      <section className="bg-gray-50 py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Map Top Bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between text-xs font-sans text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
                <span className="font-bold text-gray-700">Hotel The Blue Moon (Sri Lanka)</span>
              </div>
              <span>Use Ctrl + scroll to zoom the map</span>
            </div>

            {/* Map Body Graphic */}
            <div className="relative h-[400px] w-full bg-sky-100 flex items-center justify-center overflow-hidden">
              {/* Map Coastlines and Terrain Background (SVG Art) */}
              <svg className="absolute inset-0 w-full h-full text-emerald-100/60 fill-current" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <path d="M0,350 Q250,300 500,320 T1000,280 L1000,400 L0,400 Z" className="text-amber-50" />
                <path d="M0,300 Q150,220 300,260 T600,240 T900,200 L1000,200 L1000,0 L0,0 Z" className="text-emerald-50/70" />
                
                {/* Coastal Road grid lines */}
                <line x1="0" y1="280" x2="1000" y2="240" stroke="#fff" strokeWidth="6" strokeDasharray="3" className="opacity-90" />
                <line x1="200" y1="0" x2="200" y2="400" stroke="#fff" strokeWidth="4" className="opacity-40" />
                <line x1="530" y1="0" x2="530" y2="400" stroke="#fff" strokeWidth="4" className="opacity-40" />
                <line x1="800" y1="0" x2="800" y2="400" stroke="#fff" strokeWidth="4" className="opacity-40" />
              </svg>

              {/* Ocean details */}
              <div className="absolute bottom-6 left-12 font-serif text-[10px] text-sky-800/40 tracking-[0.3em] select-none font-bold italic uppercase">
                Indian Ocean
              </div>

              {/* Unawatuna Beach details */}
              <div className="absolute bottom-16 right-24 font-serif text-[10px] text-amber-700/60 tracking-[0.2em] select-none font-bold italic uppercase">
                Unawatuna Beach Side
              </div>

              {/* Marker pin */}
              <div className="absolute top-[55%] left-[53%] -translate-x-1/2 -translate-y-full flex flex-col items-center cursor-pointer z-10 group">
                {/* Pin Tooltip */}
                <div className="bg-resort-blue-950 text-white font-sans text-xs py-2 px-3 shadow-2xl border-l-2 border-resort-gold-300 rounded mb-2 transition-all duration-300 scale-90 group-hover:scale-100 whitespace-nowrap">
                  <div className="font-bold">Hotel The Blue Moon</div>
                  <div className="text-[10px] text-resort-gold-300">Galle, Sri Lanka ★ 4.8</div>
                </div>
                {/* Pin Point icon */}
                <div className="relative">
                  <MapPin className="w-10 h-10 text-red-500 fill-red-200 drop-shadow-xl" />
                  <div className="w-4 h-1.5 bg-black/10 rounded-full absolute -bottom-1 left-3 blur-xs"></div>
                </div>
              </div>

              {/* Map controls overlay */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-1 z-10">
                <button className="w-8 h-8 bg-white border border-gray-300 rounded shadow-md text-gray-700 text-lg font-bold hover:bg-gray-100 focus:outline-none flex items-center justify-center">+</button>
                <button className="w-8 h-8 bg-white border border-gray-300 rounded shadow-md text-gray-700 text-lg font-bold hover:bg-gray-100 focus:outline-none flex items-center justify-center">-</button>
              </div>

              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs py-2 px-3 border border-gray-200 rounded shadow-sm text-[10px] font-sans text-gray-500 flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                  <span>Resort Location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-white border-t border-dashed border-gray-400"></div>
                  <span>Beach Road / commute path</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
