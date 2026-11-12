-- ============================================================================
-- Hotel The Blue Moon - Complete Hotel Management System Database Schema
-- Project: Hotel The Blue Moon (uwdvkmromrgxftjtfqqs)
-- Region: ap-south-1
-- ============================================================================

-- Enable pgcrypto for password hashing & security helpers
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. CUSTOMER TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    address TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. ROOM TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room (
    room_no TEXT PRIMARY KEY,
    room_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved'))
);

-- ----------------------------------------------------------------------------
-- 3. ROOM_PRICING TABLE (Composite PK: room_no + period)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_pricing (
    room_no TEXT NOT NULL REFERENCES room(room_no) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('night', 'day', 'full_day')),
    price NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (room_no, period)
);

CREATE INDEX IF NOT EXISTS room_pricing_room_no_idx ON room_pricing(room_no);

-- ----------------------------------------------------------------------------
-- 4. BOOKING TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking (
    booking_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE RESTRICT,
    room_no TEXT NOT NULL REFERENCES room(room_no) ON DELETE RESTRICT,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('night', 'day', 'full_day')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_dates CHECK (check_out_date >= check_in_date)
);

CREATE INDEX IF NOT EXISTS booking_customer_id_idx ON booking(customer_id);
CREATE INDEX IF NOT EXISTS booking_room_no_idx ON booking(room_no);
CREATE INDEX IF NOT EXISTS booking_dates_idx ON booking(check_in_date, check_out_date);

-- ----------------------------------------------------------------------------
-- 5. INVOICE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(booking_id) ON DELETE RESTRICT,
    invoice_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    amount NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS invoice_booking_id_idx ON invoice(booking_id);

-- ----------------------------------------------------------------------------
-- 6. EMPLOYEE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee (
    employee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    address TEXT,
    designation TEXT NOT NULL,
    date_of_birth DATE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. LOGIN_HISTORY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_history (
    login_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_history_employee_id_idx ON login_history(employee_id);

-- ----------------------------------------------------------------------------
-- 8. SALARY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salary (
    employee_id BIGINT PRIMARY KEY REFERENCES employee(employee_id) ON DELETE CASCADE,
    basic_salary NUMERIC(10, 2) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 9. CONTACT_MESSAGES TABLE (Public Inquiries)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 10. Initial Room & Tariff Seeds (Prices in LKR)
-- ----------------------------------------------------------------------------
INSERT INTO room (room_no, room_type, status) VALUES
    ('101', 'single', 'available'),
    ('102', 'single', 'available'),
    ('201', 'double', 'available'),
    ('202', 'double', 'available'),
    ('301', 'suite', 'available'),
    ('401', 'family', 'available')
ON CONFLICT (room_no) DO UPDATE SET
    room_type = EXCLUDED.room_type,
    status = EXCLUDED.status;

INSERT INTO room_pricing (room_no, period, price) VALUES
    ('101', 'night', 10000.00),
    ('101', 'day', 20000.00),
    ('102', 'night', 10000.00),
    ('102', 'day', 20000.00),
    ('201', 'night', 20000.00),
    ('201', 'day', 40000.00),
    ('202', 'night', 20000.00),
    ('202', 'day', 40000.00),
    ('301', 'night', 50000.00),
    ('301', 'day', 80000.00),
    ('401', 'night', 100000.00),
    ('401', 'day', 150000.00)
ON CONFLICT (room_no, period) DO UPDATE SET
    price = EXCLUDED.price;

-- ----------------------------------------------------------------------------
-- 11. Row Level Security (RLS) Configuration
-- ----------------------------------------------------------------------------
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE room ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Public catalog read
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'room' AND policyname = 'Anyone can view rooms') THEN
        CREATE POLICY "Anyone can view rooms" ON room FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'room_pricing' AND policyname = 'Anyone can view room pricing') THEN
        CREATE POLICY "Anyone can view room pricing" ON room_pricing FOR SELECT USING (true);
    END IF;

    -- Public guest registration & booking creation
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer' AND policyname = 'Anyone can register as customer') THEN
        CREATE POLICY "Anyone can register as customer" ON customer FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking' AND policyname = 'Anyone can create booking') THEN
        CREATE POLICY "Anyone can create booking" ON booking FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoice' AND policyname = 'Anyone can create invoice') THEN
        CREATE POLICY "Anyone can create invoice" ON invoice FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Anyone can submit contact messages') THEN
        CREATE POLICY "Anyone can submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
    END IF;
END $$;
