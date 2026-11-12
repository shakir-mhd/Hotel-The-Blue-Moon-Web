-- ============================================================================
-- Hotel The Blue Moon - Complete Hotel Management System Database Schema
-- Project: Hotel The Blue Moon (uwdvkmromrgxftjtfqqs)
-- Region: ap-south-1 (Mumbai)
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
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning', 'reserved'))
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

CREATE INDEX IF NOT EXISTS login_history_employee_idx ON login_history(employee_id, login_time DESC);

-- ----------------------------------------------------------------------------
-- 8. SALARY TABLE (PK, FK -> employee.employee_id)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salary (
    employee_id BIGINT PRIMARY KEY REFERENCES employee(employee_id) ON DELETE CASCADE,
    basic_salary NUMERIC(10, 2) NOT NULL CHECK (basic_salary >= 0)
);

-- ----------------------------------------------------------------------------
-- 9. CONTACT_MESSAGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    message_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
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
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'room' AND policyname = 'Public read rooms') THEN
        CREATE POLICY "Public read rooms" ON room FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'room_pricing' AND policyname = 'Public read room_pricing') THEN
        CREATE POLICY "Public read room_pricing" ON room_pricing FOR SELECT USING (true);
    END IF;

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

-- ============================================================================
-- STORED PROCEDURES & SECURE RPCs
-- ============================================================================

-- RPC 1: Authenticate Staff Member (With role verification & login history tracking)
CREATE OR REPLACE FUNCTION public.authenticate_staff_member(
    p_username text,
    p_password text,
    p_position text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_emp RECORD;
    v_login_id BIGINT;
    v_last_login TIMESTAMPTZ;
BEGIN
    SELECT employee_id, name, national_id, designation, email, phone, username, password_hash
    INTO v_emp
    FROM employee
    WHERE LOWER(username) = LOWER(p_username)
    LIMIT 1;

    IF v_emp IS NULL OR v_emp.password_hash != crypt(p_password, v_emp.password_hash) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid username or password.'
        );
    END IF;

    -- Verify chosen designation matches credentials (User Guide Page 4)
    IF p_position IS NOT NULL AND p_position != '' THEN
        IF LOWER(v_emp.designation) NOT LIKE '%' || LOWER(TRIM(p_position)) || '%' THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Access Denied: Your account is registered as "' || v_emp.designation || '", but you selected the "' || p_position || '" portal. Please select your authorized position.'
            );
        END IF;
    END IF;

    -- Get previous login time
    SELECT login_time INTO v_last_login
    FROM login_history
    WHERE employee_id = v_emp.employee_id
    ORDER BY login_time DESC
    LIMIT 1;

    -- Record login event
    INSERT INTO login_history (employee_id, login_time)
    VALUES (v_emp.employee_id, now())
    RETURNING login_id INTO v_login_id;

    RETURN jsonb_build_object(
        'success', true,
        'employee_id', v_emp.employee_id,
        'name', v_emp.name,
        'designation', v_emp.designation,
        'email', v_emp.email,
        'username', v_emp.username,
        'login_id', v_login_id,
        'last_login_time', COALESCE(v_last_login, now()),
        'current_login_time', now()
    );
END;
$function$;

-- RPC 2: Web Booking Reservation (Atomic customer registration, reservation & billing)
CREATE OR REPLACE FUNCTION public.create_web_booking(
    p_name text,
    p_email text,
    p_phone text,
    p_room_type text,
    p_period text,
    p_check_in date,
    p_check_out date,
    p_total_price numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_customer_id BIGINT;
    v_booking_id BIGINT;
    v_invoice_id BIGINT;
    v_room_no TEXT;
    v_ref TEXT;
BEGIN
    SELECT customer_id INTO v_customer_id
    FROM customer
    WHERE email = p_email
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        INSERT INTO customer (name, national_id, address, email, phone, username, password_hash)
        VALUES (
            p_name,
            'NIC-' || lpad(floor(random() * 1000000000)::text, 9, '0') || 'V',
            'Online Web Reservation Guest',
            p_email,
            p_phone,
            p_email,
            crypt('GuestPass2026!', gen_salt('bf'))
        )
        RETURNING customer_id INTO v_customer_id;
    END IF;

    SELECT room_no INTO v_room_no
    FROM room
    WHERE room_type = p_room_type AND status = 'available'
    ORDER BY room_no
    LIMIT 1;

    IF v_room_no IS NULL THEN
        SELECT room_no INTO v_room_no
        FROM room
        WHERE room_type = p_room_type
        ORDER BY room_no
        LIMIT 1;
    END IF;

    INSERT INTO booking (customer_id, room_no, booking_status, check_in_date, check_out_date, period)
    VALUES (v_customer_id, v_room_no, 'pending', p_check_in, p_check_out, p_period)
    RETURNING booking_id INTO v_booking_id;

    INSERT INTO invoice (booking_id, invoice_date, amount)
    VALUES (v_booking_id, now(), p_total_price)
    RETURNING invoice_id INTO v_invoice_id;

    v_ref := 'BMN-' || lpad(v_booking_id::text, 6, '0') || '-2026';

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_ref,
        'invoice_id', v_invoice_id,
        'room_no', v_room_no,
        'amount', p_total_price
    );
END;
$function$;

-- RPC 3: Walk-in Booking (User Guide Page 5: Add New Booking)
CREATE OR REPLACE FUNCTION public.create_walkin_booking(
    p_name text,
    p_national_id text,
    p_address text,
    p_email text,
    p_phone text,
    p_room_no text,
    p_check_in date,
    p_check_out date,
    p_period text,
    p_total_price numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_customer_id BIGINT;
    v_booking_id BIGINT;
    v_invoice_id BIGINT;
    v_ref TEXT;
BEGIN
    SELECT customer_id INTO v_customer_id
    FROM customer
    WHERE email = p_email OR national_id = p_national_id
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        INSERT INTO customer (name, national_id, address, email, phone, username, password_hash)
        VALUES (
            p_name,
            p_national_id,
            COALESCE(p_address, 'Hotel Walk-in Guest'),
            p_email,
            p_phone,
            p_email,
            crypt('WalkInGuest2026!', gen_salt('bf'))
        )
        RETURNING customer_id INTO v_customer_id;
    ELSE
        UPDATE customer
        SET name = p_name, phone = p_phone, address = COALESCE(p_address, address)
        WHERE customer_id = v_customer_id;
    END IF;

    INSERT INTO booking (customer_id, room_no, booking_status, check_in_date, check_out_date, period)
    VALUES (v_customer_id, p_room_no, 'checked_in', p_check_in, p_check_out, p_period)
    RETURNING booking_id INTO v_booking_id;

    UPDATE room SET status = 'occupied' WHERE room_no = p_room_no;

    INSERT INTO invoice (booking_id, invoice_date, amount)
    VALUES (v_booking_id, now(), p_total_price)
    RETURNING invoice_id INTO v_invoice_id;

    v_ref := 'BMN-' || lpad(v_booking_id::text, 6, '0') || '-2026';

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_ref,
        'invoice_id', v_invoice_id,
        'room_no', p_room_no,
        'amount', p_total_price
    );
END;
$function$;

-- RPC 4: Stay Status Updater (Checkout triggers housekeeping queue automatically)
CREATE OR REPLACE FUNCTION public.update_stay_status(
    p_booking_id bigint,
    p_new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_room_no TEXT;
BEGIN
    SELECT room_no INTO v_room_no FROM booking WHERE booking_id = p_booking_id;
    
    IF v_room_no IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    UPDATE booking SET booking_status = p_new_status WHERE booking_id = p_booking_id;

    IF p_new_status = 'checked_in' THEN
        UPDATE room SET status = 'occupied' WHERE room_no = v_room_no;
    ELSIF p_new_status = 'checked_out' THEN
        UPDATE room SET status = 'maintenance' WHERE room_no = v_room_no;
    ELSIF p_new_status = 'cancelled' THEN
        UPDATE room SET status = 'available' WHERE room_no = v_room_no;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'room_no', v_room_no,
        'new_status', p_new_status
    );
END;
$function$;

-- RPC 5: Set Room Status Live
CREATE OR REPLACE FUNCTION public.set_room_status(
    p_room_no text,
    p_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    UPDATE room SET status = p_status WHERE room_no = p_room_no;
    RETURN jsonb_build_object('success', true, 'room_no', p_room_no, 'status', p_status);
END;
$function$;

-- RPC 6: Generate Monthly Financial Report (User Guide Page 7: Manager)
CREATE OR REPLACE FUNCTION public.generate_monthly_report(
    p_year integer DEFAULT (EXTRACT(year FROM CURRENT_DATE))::integer,
    p_month integer DEFAULT (EXTRACT(month FROM CURRENT_DATE))::integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_earnings NUMERIC(12, 2);
    v_total_bookings INT;
    v_unique_customers INT;
    v_subtotal NUMERIC(12, 2);
    v_tax_amount NUMERIC(12, 2);
    v_popular_room TEXT;
BEGIN
    v_start_date := make_date(p_year, p_month, 1);
    v_end_date := (v_start_date + INTERVAL '1 month')::DATE;

    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_earnings
    FROM invoice
    WHERE invoice_date >= v_start_date AND invoice_date < v_end_date;

    v_subtotal := ROUND(v_total_earnings / 1.18, 2);
    v_tax_amount := v_total_earnings - v_subtotal;

    SELECT COUNT(*)
    INTO v_total_bookings
    FROM booking
    WHERE created_at >= v_start_date AND created_at < v_end_date;

    SELECT COUNT(DISTINCT customer_id)
    INTO v_unique_customers
    FROM booking
    WHERE created_at >= v_start_date AND created_at < v_end_date;

    SELECT room_no INTO v_popular_room
    FROM booking
    WHERE created_at >= v_start_date AND created_at < v_end_date
    GROUP BY room_no
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    RETURN jsonb_build_object(
        'success', true,
        'year', p_year,
        'month', p_month,
        'month_name', to_char(v_start_date, 'FMMonth YYYY'),
        'total_earnings', v_total_earnings,
        'subtotal', v_subtotal,
        'tax_amount', v_tax_amount,
        'total_bookings', v_total_bookings,
        'unique_customers', v_unique_customers,
        'most_booked_room', COALESCE(v_popular_room, 'None'),
        'generated_at', now()
    );
END;
$function$;

-- RPC 7: Get Staff Dashboard Data
CREATE OR REPLACE FUNCTION public.get_staff_dashboard_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_rooms JSONB;
    v_bookings JSONB;
    v_invoices JSONB;
    v_logins JSONB;
    v_staff JSONB;
    v_customers JSONB;
    v_stats JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'room_no', r.room_no,
            'room_type', r.room_type,
            'status', r.status,
            'current_booking', (
                SELECT jsonb_build_object(
                    'booking_id', b.booking_id,
                    'booking_reference', ('BMN-' || lpad(b.booking_id::text, 6, '0') || '-2026'),
                    'guest_name', c.name,
                    'guest_phone', c.phone,
                    'check_in_date', b.check_in_date,
                    'check_out_date', b.check_out_date,
                    'booking_status', b.booking_status
                )
                FROM booking b
                JOIN customer c ON b.customer_id = c.customer_id
                WHERE b.room_no = r.room_no
                  AND b.booking_status IN ('confirmed', 'checked_in')
                  AND CURRENT_DATE BETWEEN b.check_in_date AND b.check_out_date
                ORDER BY b.check_in_date DESC
                LIMIT 1
            )
        )
        ORDER BY r.room_no
    ) INTO v_rooms
    FROM room r;

    SELECT jsonb_agg(
        jsonb_build_object(
            'booking_id', b.booking_id,
            'booking_reference', ('BMN-' || lpad(b.booking_id::text, 6, '0') || '-2026'),
            'guest_name', c.name,
            'guest_email', c.email,
            'guest_phone', c.phone,
            'room_no', b.room_no,
            'booking_status', b.booking_status,
            'check_in_date', b.check_in_date,
            'check_out_date', b.check_out_date,
            'period', b.period,
            'created_at', b.created_at,
            'invoice_amount', i.amount
        )
        ORDER BY b.booking_id DESC
    ) INTO v_bookings
    FROM booking b
    JOIN customer c ON b.customer_id = c.customer_id
    LEFT JOIN invoice i ON b.booking_id = i.booking_id;

    SELECT jsonb_agg(
        jsonb_build_object(
            'invoice_id', i.invoice_id,
            'booking_id', i.booking_id,
            'booking_reference', ('BMN-' || lpad(b.booking_id::text, 6, '0') || '-2026'),
            'guest_name', c.name,
            'invoice_date', i.invoice_date,
            'amount', i.amount
        )
        ORDER BY i.invoice_id DESC
    ) INTO v_invoices
    FROM invoice i
    JOIN booking b ON i.booking_id = b.booking_id
    JOIN customer c ON b.customer_id = c.customer_id;

    SELECT jsonb_agg(
        jsonb_build_object(
            'login_id', lh.login_id,
            'employee_name', e.name,
            'designation', e.designation,
            'login_time', lh.login_time
        )
        ORDER BY lh.login_time DESC
    ) INTO v_logins
    FROM (
        SELECT * FROM login_history ORDER BY login_time DESC LIMIT 20
    ) lh
    JOIN employee e ON lh.employee_id = e.employee_id;

    SELECT jsonb_agg(
        jsonb_build_object(
            'employee_id', e.employee_id,
            'name', e.name,
            'national_id', e.national_id,
            'designation', e.designation,
            'email', e.email,
            'phone', e.phone,
            'basic_salary', s.basic_salary
        )
        ORDER BY e.employee_id
    ) INTO v_staff
    FROM employee e
    LEFT JOIN salary s ON e.employee_id = s.employee_id;

    SELECT jsonb_agg(
        jsonb_build_object(
            'customer_id', c.customer_id,
            'name', c.name,
            'national_id', c.national_id,
            'email', c.email,
            'phone', c.phone,
            'address', c.address,
            'total_bookings', (SELECT COUNT(*) FROM booking WHERE customer_id = c.customer_id)
        )
        ORDER BY c.customer_id DESC
    ) INTO v_customers
    FROM customer c;

    SELECT jsonb_agg(
        jsonb_build_object(
            'total_rooms', (SELECT COUNT(*) FROM room),
            'available_rooms', (SELECT COUNT(*) FROM room WHERE status = 'available'),
            'occupied_rooms', (SELECT COUNT(*) FROM room WHERE status = 'occupied'),
            'maintenance_rooms', (SELECT COUNT(*) FROM room WHERE status IN ('maintenance', 'cleaning')),
            'total_bookings', (SELECT COUNT(*) FROM booking),
            'total_revenue', COALESCE((SELECT SUM(amount) FROM invoice), 0)
        )
    ) INTO v_stats;

    RETURN jsonb_build_object(
        'success', true,
        'stats', v_stats,
        'rooms', COALESCE(v_rooms, '[]'::jsonb),
        'bookings', COALESCE(v_bookings, '[]'::jsonb),
        'invoices', COALESCE(v_invoices, '[]'::jsonb),
        'logins', COALESCE(v_logins, '[]'::jsonb),
        'staff', COALESCE(v_staff, '[]'::jsonb),
        'customers', COALESCE(v_customers, '[]'::jsonb)
    );
END;
$function$;

-- RPC 8: Guest Reservation Lookup
CREATE OR REPLACE FUNCTION public.get_booking_by_reference(
    p_reference text,
    p_contact text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_booking_id BIGINT;
    v_clean_ref TEXT;
    v_result RECORD;
BEGIN
    v_clean_ref := regexp_replace(p_reference, '[^0-9]', '', 'g');
    
    IF v_clean_ref = '' THEN
        RETURN jsonb_build_object('found', false, 'message', 'Invalid booking reference format.');
    END IF;

    v_booking_id := v_clean_ref::BIGINT;

    SELECT 
        b.booking_id,
        ('BMN-' || lpad(b.booking_id::text, 6, '0') || '-2026') AS booking_reference,
        b.booking_status AS status,
        b.room_no,
        r.room_type,
        b.check_in_date,
        b.check_out_date,
        b.period,
        c.name AS guest_name,
        c.email AS guest_email,
        c.phone AS guest_phone,
        i.invoice_id,
        i.invoice_date,
        i.amount AS invoice_amount
    INTO v_result
    FROM booking b
    JOIN customer c ON b.customer_id = c.customer_id
    JOIN room r ON b.room_no = r.room_no
    LEFT JOIN invoice i ON b.booking_id = i.booking_id
    WHERE b.booking_id = v_booking_id
      AND (
          LOWER(c.email) = LOWER(TRIM(p_contact))
          OR c.phone = TRIM(p_contact)
          OR regexp_replace(c.phone, '[^0-9]', '', 'g') = regexp_replace(p_contact, '[^0-9]', '', 'g')
      )
    LIMIT 1;

    IF v_result.booking_id IS NULL THEN
        RETURN jsonb_build_object('found', false, 'message', 'No reservation found matching this reference and contact detail.');
    END IF;

    RETURN jsonb_build_object(
        'found', true,
        'booking_id', v_result.booking_id,
        'booking_reference', v_result.booking_reference,
        'status', v_result.status,
        'room_no', v_result.room_no,
        'room_type', v_result.room_type,
        'check_in_date', v_result.check_in_date,
        'check_out_date', v_result.check_out_date,
        'period', v_result.period,
        'guest_name', v_result.guest_name,
        'guest_email', v_result.guest_email,
        'guest_phone', v_result.guest_phone,
        'invoice_id', v_result.invoice_id,
        'invoice_date', v_result.invoice_date,
        'invoice_amount', v_result.invoice_amount
    );
END;
$function$;
