# Hotel The Blue Moon — Luxury Resort & Spa Web Platform

A high-performance, single-page hospitality web application and hotel management platform designed for **Hotel The Blue Moon**, located in Unawatuna, Galle, Sri Lanka.

## Architecture & Features

- **Frontend:** Vanilla JavaScript (ES6 Modules), Bootstrap 5.3.3, Custom CSS3 Design System
- **Build Tool:** Vite 8 (Zero virtual-DOM overhead, sub-200ms build times, < 16 kB gzip asset payload)
- **Backend & Database:** Supabase (PostgreSQL 17) with Row Level Security (RLS)
- **Currency:** Sri Lankan Rupees (`LKR`)
- **Key Modules:**
  - **Guest Experience:** Dynamic Room Tariffs (One Night vs. 24H Flex Stay), Multi-Step Booking Wizard, Responsive Amenities Showcase, Fullscreen Photography Lightbox, and Guest Booking/Invoice Lookup.
  - **Staff Operations Hub (`admin.html`):** Role-based staff authentication, visual Front-Desk Room Rack (Available, Occupied, Maintenance), Guest Check-in/Check-out management, and Invoice Ledger.

## Database Schema (PostgreSQL 17)

- `customer` — Guest identity and contact profiles
- `room` — Physical room inventory (Rooms 101, 102, 201, 202, 301, 401)
- `room_pricing` — Composite key dual-tariff rates (Night vs. Day)
- `booking` — Reservations with date range validation and guest links
- `invoice` — Billing ledger linked 1-to-1 with bookings
- `employee` — Staff roster and designations (Manager, Receptionist)
- `login_history` — Staff audit authentication logs
- `salary` — Compensation records
- `contact_messages` — Public customer inquiries

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Compile production bundle
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and configure your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
