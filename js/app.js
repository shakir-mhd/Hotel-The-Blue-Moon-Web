/**
 * Hotel The Blue Moon - Main Application Logic
 * Vanilla JavaScript (ES6) with Supabase Database Integration
 */

import { supabaseClient } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize lucide icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // State Management
  const state = {
    activeTab: 'home',
    billingPeriod: 'night', // 'night' or 'day'
    bookingStep: 1,
    selectedRoom: 'single',
    selectedStayType: 'night',
    targetRoomId: null,
    galleryIdx: null,
    roomsDb: {}, // Keyed by room_type from Supabase
    bookingData: {
      checkIn: '',
      checkOut: '',
      roomType: 'single',
      stayType: 'night',
      adults: 1,
      children: 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: ''
    }
  };

  // Pricing Data Reference (Prices in LKR)
  const ROOM_DATA = {
    single: {
      title: "Single Room",
      prices: { night: 10000, day: 20000 },
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
      }
    },
    double: {
      title: "Double Room",
      prices: { night: 20000, day: 40000 },
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
      }
    },
    suite: {
      title: "Suite Room",
      prices: { night: 50000, day: 80000 },
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
      }
    },
    family: {
      title: "Family Room",
      prices: { night: 100000, day: 150000 },
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
      }
    }
  };

  // Format LKR (Sri Lankan Rupee) Currency Helper
  function formatLKR(amount) {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(amount);
    return `LKR ${formatted}`;
  }

  // Load Rooms from Supabase to sync UUIDs and live rates
  async function loadRoomsFromSupabase() {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient.from('rooms').select('*');
      if (error) {
        console.warn("Could not sync rooms from Supabase:", error);
        return;
      }
      if (data && data.length > 0) {
        data.forEach(room => {
          state.roomsDb[room.room_type] = room;
        });
        console.log("Hotel The Blue Moon: Rooms synced from Supabase:", state.roomsDb);
      }
    } catch (err) {
      console.error("Room sync error:", err);
    }
  }

  // Initialize Date Guards (prevent booking past dates and enforce checkout > checkin)
  function initDateGuards() {
    const today = new Date().toISOString().split('T')[0];
    const checkIn = document.getElementById('booking-checkin');
    const checkOut = document.getElementById('booking-checkout');

    if (checkIn) checkIn.min = today;
    if (checkOut) checkOut.min = today;

    checkIn?.addEventListener('change', () => {
      if (checkIn.value) {
        checkOut.min = checkIn.value;
        if (checkOut.value && checkOut.value <= checkIn.value) {
          const nextDay = new Date(checkIn.value);
          nextDay.setDate(nextDay.getDate() + 1);
          checkOut.value = nextDay.toISOString().split('T')[0];
        }
        updateBookingSummary();
      }
    });
  }

  // Navbar Scroll Handler
  const navbar = document.querySelector('.navbar-custom');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Tab Navigation Handler
  window.switchTab = function(tabId, targetRoom = null) {
    state.activeTab = tabId;
    
    // Hide all tab views
    document.querySelectorAll('.tab-content-view').forEach(view => {
      view.classList.add('d-none');
    });

    // Show target tab view
    const activeView = document.getElementById(`tab-view-${tabId}`);
    if (activeView) {
      activeView.classList.remove('d-none');
      activeView.classList.add('fade-in-section');
    }

    // Update nav active states
    document.querySelectorAll('.nav-link-custom').forEach(link => {
      if (link.dataset.tab === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle scroll to specific room in pricing tab if requested
    if (tabId === 'pricing' && targetRoom) {
      setTimeout(() => {
        const roomCard = document.getElementById(`pricing-${targetRoom}`);
        if (roomCard) {
          roomCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          roomCard.classList.add('border-warning', 'shadow-lg');
          setTimeout(() => roomCard.classList.remove('border-warning', 'shadow-lg'), 3000);
        }
      }, 300);
    }
  };

  // Pricing Duration Toggle Switcher
  window.setBillingPeriod = function(period) {
    state.billingPeriod = period;
    const bg = document.getElementById('toggle-bg');
    const btnNight = document.getElementById('btn-period-night');
    const btnDay = document.getElementById('btn-period-day');
    const descText = document.getElementById('period-description');

    if (period === 'night') {
      bg?.classList.remove('day');
      btnNight?.classList.add('active');
      btnDay?.classList.remove('active');
      if (descText) descText.textContent = "Standard Stay: Check-in from 2:00 PM, Check-out by 11:00 AM standard resort hours.";
    } else {
      bg?.classList.add('day');
      btnDay?.classList.add('active');
      btnNight?.classList.remove('active');
      if (descText) descText.textContent = "Ultimate Stay: Dynamic 24-hour cycle. Check out exactly 24 hours after your chosen check-in time.";
    }

    // Update prices and perks on pricing cards
    Object.keys(ROOM_DATA).forEach(roomId => {
      const priceElem = document.getElementById(`price-val-${roomId}`);
      const durationElem = document.getElementById(`price-duration-${roomId}`);
      const perkListElem = document.getElementById(`perk-list-${roomId}`);

      if (priceElem) priceElem.textContent = formatLKR(ROOM_DATA[roomId].prices[period]);
      if (durationElem) durationElem.textContent = `Per ${period === 'night' ? 'Night' : 'Full Day'} Stay`;
      
      if (perkListElem) {
        perkListElem.innerHTML = ROOM_DATA[roomId].perks[period].map(perk => `
          <li class="d-flex align-items-center mb-2">
            <span class="badge bg-warning-subtle text-warning rounded-circle me-2 p-1">✓</span>
            <span class="small text-secondary">${perk}</span>
          </li>
        `).join('');
      }
    });
  };

  // Amenities Expand Details Panel
  const AMENITIES_DETAILS = {
    1: {
      title: "An Infinite-edge Pool",
      desc: "Our signature infinite-edge pool seamlessly blends with the ocean horizon, offering an unparalleled swimming experience. Relax on premium sun loungers, enjoy signature cocktails from the swim-up bar, or watch the sunset over the coast.",
      img: "/images/amenity-pool.jpg",
      highlights: ["Hours: 6:00 AM - 10:00 PM", "Complimentary poolside towels & refreshments", "Swim-up bar with signature cocktails"]
    },
    2: {
      title: "An Iconic Spa",
      desc: "Escape to our world-class spa sanctuary, designed to restore balance to your body and mind. We offer bespoke therapies, custom facials, and traditional massages performed by certified wellness experts.",
      img: "/images/amenity-spa.jpg",
      highlights: ["Hours: 9:00 AM - 8:00 PM", "Private steam and sauna rooms", "Complimentary herbal teas & aromatherapy"]
    },
    3: {
      title: "Luxurious Rooms",
      desc: "Every room and suite at Blue Moon is crafted with elegant design, modern automated features, and premium linens to ensure a restful stay. Enjoy panoramic views and 24/7 personal service.",
      img: "/images/amenity-rooms.jpg",
      highlights: ["Private balcony with sea/garden views", "Smart room control & high-speed WiFi", "24/7 personalized room service"]
    }
  };

  window.openAmenityDetail = function(id) {
    const detail = AMENITIES_DETAILS[id];
    if (!detail) return;
    const panel = document.getElementById('amenity-detail-panel');
    if (!panel) return;

    document.getElementById('amenity-detail-img').src = detail.img;
    document.getElementById('amenity-detail-title').textContent = detail.title;
    document.getElementById('amenity-detail-desc').textContent = detail.desc;
    document.getElementById('amenity-detail-highlights').innerHTML = detail.highlights.map(h => `
      <li class="d-flex align-items-center mb-2 small text-dark">
        <span class="text-warning fw-bold me-2">✓</span> ${h}
      </li>
    `).join('');

    panel.classList.remove('d-none');
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.closeAmenityDetail = function() {
    document.getElementById('amenity-detail-panel')?.classList.add('d-none');
  };

  // Gallery Lightbox Modal
  const GALLERY_IMAGES = [
    { src: "/images/gallery-1.jpg", alt: "Ocean View Loungers" },
    { src: "/images/gallery-2.jpg", alt: "Resort Dining Table Close-up" },
    { src: "/images/hero-bg.jpg", alt: "Santorini Terrace Dining" },
    { src: "/images/room-single.jpg", alt: "Ocean View Master Suite" },
    { src: "/images/gallery-3.jpg", alt: "Shade Sail Cliffside Terrace" },
    { src: "/images/about-spa.jpg", alt: "Greek Church Blue Dome" }
  ];

  window.openLightbox = function(idx) {
    state.galleryIdx = idx;
    const modal = document.getElementById('gallery-lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    if (!modal || !img) return;

    img.src = GALLERY_IMAGES[idx].src;
    if (caption) caption.textContent = GALLERY_IMAGES[idx].alt;
    modal.classList.add('active');
  };

  window.closeLightbox = function() {
    document.getElementById('gallery-lightbox')?.classList.remove('active');
  };

  window.prevLightbox = function(e) {
    if (e) e.stopPropagation();
    state.galleryIdx = (state.galleryIdx === 0) ? GALLERY_IMAGES.length - 1 : state.galleryIdx - 1;
    openLightbox(state.galleryIdx);
  };

  window.nextLightbox = function(e) {
    if (e) e.stopPropagation();
    state.galleryIdx = (state.galleryIdx === GALLERY_IMAGES.length - 1) ? 0 : state.galleryIdx + 1;
    openLightbox(state.galleryIdx);
  };

  // Booking Modal Wizard
  window.openBookingModal = function(room = 'single', stayType = 'night') {
    state.selectedRoom = room;
    state.selectedStayType = stayType;
    state.bookingStep = 1;
    
    // Set selects
    const roomSelect = document.getElementById('booking-room-type');
    const staySelect = document.getElementById('booking-stay-type');
    if (roomSelect) roomSelect.value = room;
    if (staySelect) staySelect.value = stayType;

    document.getElementById('booking-modal')?.classList.add('active');
    updateBookingSummary();
    showBookingStep(1);
  };

  window.closeBookingModal = function() {
    document.getElementById('booking-modal')?.classList.remove('active');
  };

  function showBookingStep(step) {
    state.bookingStep = step;
    document.querySelectorAll('.booking-step-pane').forEach(p => p.classList.add('d-none'));
    document.getElementById(`booking-step-${step}`)?.classList.remove('d-none');
  }

  function updateBookingSummary() {
    const checkIn = document.getElementById('booking-checkin')?.value;
    const checkOut = document.getElementById('booking-checkout')?.value;
    const roomType = document.getElementById('booking-room-type')?.value || 'single';
    const stayType = document.getElementById('booking-stay-type')?.value || 'night';

    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = end.getTime() - start.getTime();
      const nights = Math.ceil(diff / (1000 * 3600 * 24));

      if (nights > 0) {
        const rate = ROOM_DATA[roomType]?.prices[stayType] || 10000;
        const subtotal = rate * nights;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + tax;

        document.getElementById('sum-nights').textContent = `${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
        document.getElementById('sum-subtotal').textContent = formatLKR(subtotal);
        document.getElementById('sum-tax').textContent = formatLKR(tax);
        document.getElementById('sum-total').textContent = formatLKR(total);
      } else {
        document.getElementById('sum-nights').textContent = '0 Nights';
        document.getElementById('sum-subtotal').textContent = 'LKR 0';
        document.getElementById('sum-tax').textContent = 'LKR 0';
        document.getElementById('sum-total').textContent = 'LKR 0';
      }
    }
  }

  // Recalculate booking summary when fields change
  ['booking-checkin', 'booking-checkout', 'booking-room-type', 'booking-stay-type'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateBookingSummary);
  });

  window.handleBookingNext = async function() {
    if (state.bookingStep === 1) {
      const checkIn = document.getElementById('booking-checkin')?.value;
      const checkOut = document.getElementById('booking-checkout')?.value;

      if (!checkIn || !checkOut) {
        alert("Please select both check-in and check-out dates.");
        return;
      }

      if (new Date(checkOut) <= new Date(checkIn)) {
        alert("Check-out date must be after your check-in date.");
        return;
      }

      showBookingStep(2);
    } else if (state.bookingStep === 2) {
      const fName = document.getElementById('booking-fname')?.value?.trim();
      const lName = document.getElementById('booking-lname')?.value?.trim();
      const email = document.getElementById('booking-email')?.value?.trim();
      const phone = document.getElementById('booking-phone')?.value?.trim();

      if (!fName || !lName || !email || !phone) {
        alert("Please complete all required contact fields (*).");
        return;
      }

      const confirmBtn = document.querySelector('#booking-step-2 .btn-resort-gold');
      const originalBtnText = confirmBtn ? confirmBtn.textContent : '';
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "CONFIRMING...";
      }

      const checkIn = document.getElementById('booking-checkin')?.value;
      const checkOut = document.getElementById('booking-checkout')?.value;
      const roomType = document.getElementById('booking-room-type')?.value || 'single';
      const stayType = document.getElementById('booking-stay-type')?.value || 'night';

      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = end.getTime() - start.getTime();
      const nights = Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
      const rate = ROOM_DATA[roomType]?.prices[stayType] || 10000;
      const subtotal = rate * nights;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      // Save reservation to Supabase database (Customer, Room, Booking, Invoice)
      let generatedRef = `BMN-${Math.floor(100000 + Math.random() * 900000)}-2026`;

      if (supabaseClient) {
        try {
          const { data: bookingResult, error } = await supabaseClient.rpc('create_web_booking', {
            p_name: `${fName} ${lName}`,
            p_email: email,
            p_phone: phone,
            p_room_type: roomType,
            p_check_in: checkIn,
            p_check_out: checkOut,
            p_period: stayType,
            p_total_price: total
          });

          if (error) {
            console.error("Supabase booking error:", error);
            alert("We could not complete your booking online: " + error.message);
            if (confirmBtn) {
              confirmBtn.disabled = false;
              confirmBtn.textContent = originalBtnText;
            }
            return;
          }

          if (bookingResult && bookingResult.booking_reference) {
            generatedRef = bookingResult.booking_reference;
          }
          console.log("Hotel The Blue Moon: Reservation & Invoice created:", bookingResult);
        } catch (err) {
          console.error("Booking error:", err);
          alert("An unexpected error occurred while saving your booking. Please try again.");
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = originalBtnText;
          }
          return;
        }
      }

      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalBtnText;
      }

      document.getElementById('booking-ref-display').textContent = generatedRef;
      showBookingStep(3);
    }
  };

  window.handleBookingBack = function() {
    if (state.bookingStep > 1) {
      showBookingStep(state.bookingStep - 1);
    }
  };

  // Contact Form Submission Handler
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value?.trim();
    const email = document.getElementById('contact-email')?.value?.trim();
    const subject = document.getElementById('contact-subject')?.value?.trim();
    const message = document.getElementById('contact-message')?.value?.trim() || '';

    if (!name || !email || !subject) {
      alert("Please fill in all required fields (*).");
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "SENDING...";
    }

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('contact_messages').insert([{
          name,
          email,
          subject,
          message
        }]);

        if (error) {
          console.error("Supabase contact error:", error);
          alert("Could not send your message right now: " + error.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "SUBMIT MESSAGE";
          }
          return;
        }

        console.log("Hotel The Blue Moon: Contact message submitted to Supabase.");
      } catch (err) {
        console.error("Contact form error:", err);
        alert("Failed to submit inquiry. Please try again.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "SUBMIT MESSAGE";
        }
        return;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "SUBMIT MESSAGE";
    }

    contactForm.classList.add('d-none');
    document.getElementById('contact-success-msg')?.classList.remove('d-none');
  });

  window.resetContactForm = function() {
    contactForm?.reset();
    contactForm?.classList.remove('d-none');
    document.getElementById('contact-success-msg')?.classList.add('d-none');
  };

  // State for last looked-up reservation
  let currentLookupBooking = null;

  window.openLookupModal = function() {
    document.getElementById('lookup-modal')?.classList.add('active');
    document.getElementById('lookup-alert')?.classList.add('d-none');
    document.getElementById('lookup-result-card')?.classList.add('d-none');
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeLookupModal = function() {
    document.getElementById('lookup-modal')?.classList.remove('active');
  };

  // Guest Lookup Submission Handler
  const lookupForm = document.getElementById('guest-lookup-form');
  lookupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ref = document.getElementById('lookup-ref')?.value?.trim();
    const contact = document.getElementById('lookup-contact')?.value?.trim();
    const alertBox = document.getElementById('lookup-alert');
    const resultCard = document.getElementById('lookup-result-card');
    const submitBtn = document.getElementById('lookup-submit-btn');

    if (!ref || !contact) return;

    if (alertBox) alertBox.classList.add('d-none');
    if (resultCard) resultCard.classList.add('d-none');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'SEARCHING...';
    }

    try {
      if (!supabaseClient) throw new Error("Supabase is not initialized.");

      const { data, error } = await supabaseClient.rpc('get_booking_by_reference', {
        p_reference: ref,
        p_contact: contact
      });

      if (error || !data || !data.found) {
        if (alertBox) {
          alertBox.textContent = data?.message || "No reservation found matching this reference and contact detail. Please check and try again.";
          alertBox.classList.remove('d-none');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'SEARCH RESERVATION';
        }
        return;
      }

      currentLookupBooking = data;

      // Populate Result Card
      document.getElementById('res-ref').textContent = data.booking_reference;
      document.getElementById('res-status').textContent = (data.status || 'pending').replace('_', ' ');
      document.getElementById('res-guest-name').textContent = data.guest_name;
      document.getElementById('res-room').textContent = `Room ${data.room_no || 'TBD'} (${data.room_type || 'Room'})`;
      document.getElementById('res-checkin').textContent = data.check_in_date;
      document.getElementById('res-checkout').textContent = data.check_out_date;
      document.getElementById('res-total').textContent = formatLKR(data.invoice_amount || 0);
      document.getElementById('res-inv-no').textContent = `INV-${String(data.invoice_id || data.booking_id).padStart(6, '0')}`;

      if (resultCard) resultCard.classList.remove('d-none');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEARCH RESERVATION';
      }
      if (window.lucide) window.lucide.createIcons();

    } catch (err) {
      console.error("Lookup error:", err);
      if (alertBox) {
        alertBox.textContent = "Could not check reservation right now. Please try again or call our reception directly.";
        alertBox.classList.remove('d-none');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEARCH RESERVATION';
      }
    }
  });

  // Printable Official Invoice Pop-up for Guest
  window.printFoundInvoice = function() {
    if (!currentLookupBooking) return;
    const b = currentLookupBooking;
    const total = b.invoice_amount || 0;
    const subtotal = Math.round(total / 1.18);
    const tax = total - subtotal;
    const dateStr = b.invoice_date ? new Date(b.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US');

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert("Please allow pop-ups to print your official receipt.");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${b.booking_reference}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; color: #1e293b; }
          .receipt-box { max-width: 680px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 2.5rem; }
          .stamp { border: 2px dashed #10b981; color: #10b981; font-weight: bold; padding: 4px 10px; border-radius: 6px; display: inline-block; transform: rotate(-5deg); }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
            <div>
              <h2 class="h3 fw-bold mb-1" style="color: #0c1a30;">Hotel The Blue Moon</h2>
              <div class="small text-muted">2855 Beach Side Rd, Unawatuna, Galle, Sri Lanka</div>
              <div class="small text-muted">Tel: +94 717 224 755 | Email: shakirvta01@gmail.com</div>
            </div>
            <div class="text-end">
              <span class="stamp mb-2">PAID &amp; CONFIRMED</span>
              <div class="font-monospace small text-muted">INV-${String(b.invoice_id || b.booking_id).padStart(6, '0')}</div>
            </div>
          </div>

          <div class="row g-3 py-2 border-bottom mb-4 small">
            <div class="col-6">
              <strong class="d-block">Guest: ${b.guest_name}</strong>
              <div class="text-muted">${b.guest_email}</div>
              <div class="text-muted">${b.guest_phone}</div>
            </div>
            <div class="col-6 text-end">
              <div>Booking Ref: <strong class="font-monospace text-primary">${b.booking_reference}</strong></div>
              <div>Date: ${dateStr}</div>
              <div>Stay: ${b.period === 'day' ? 'Full Day 24H Flex' : 'Night Stay'}</div>
            </div>
          </div>

          <table class="table align-middle mb-4">
            <thead class="table-light small text-uppercase">
              <tr>
                <th>Accommodation</th>
                <th class="text-center">Dates</th>
                <th class="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${b.room_type ? b.room_type.toUpperCase() : 'SUITE'} ROOM</strong>
                  <div class="small text-muted">Assigned Room: ${b.room_no || '301'}</div>
                </td>
                <td class="text-center small">${b.check_in_date} → ${b.check_out_date}</td>
                <td class="text-end fw-bold">LKR ${new Intl.NumberFormat('en-US').format(subtotal)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="small text-muted">
                <td colspan="2" class="text-end">Resort Service &amp; VAT (18%):</td>
                <td class="text-end">LKR ${new Intl.NumberFormat('en-US').format(tax)}</td>
              </tr>
              <tr class="h5 fw-bold text-dark">
                <td colspan="2" class="text-end">Total Amount:</td>
                <td class="text-end text-success">LKR ${new Intl.NumberFormat('en-US').format(total)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="pt-4 border-top text-center small text-muted">
            <p class="mb-1">Thank you for staying at Hotel The Blue Moon!</p>
            <p style="font-size: 11px;">Official Electronic Receipt &bull; Reg No: LK-80000-BMN</p>
            <div class="mt-4 no-print">
              <button onclick="window.print()" class="btn btn-dark px-4 py-2">Print Receipt</button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Run initialization routines
  initDateGuards();
  loadRoomsFromSupabase();
  setBillingPeriod('night');
});
