-- ============================================================
-- APPOINTMENT BOOKING PLATFORM — SUPABASE SCHEMA
-- Run this as a single migration in Supabase SQL Editor
-- ============================================================

-- ======================== EXTENSIONS ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================== ENUMS ========================
CREATE TYPE user_role        AS ENUM ('customer', 'organiser', 'admin');
CREATE TYPE appointment_type AS ENUM ('user', 'resource');
CREATE TYPE resource_assign  AS ENUM ('auto', 'manual');
CREATE TYPE schedule_type    AS ENUM ('weekly', 'flexible');
CREATE TYPE question_type    AS ENUM ('text', 'select', 'boolean');
CREATE TYPE booking_status   AS ENUM ('pending', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show');
CREATE TYPE payment_status   AS ENUM ('unpaid', 'pending_payment', 'paid', 'refunded');
CREATE TYPE payment_method   AS ENUM ('card', 'upi', 'paypal');
CREATE TYPE booking_channel  AS ENUM ('web', 'whatsapp', 'voice');
CREATE TYPE resource_type    AS ENUM ('user', 'room', 'equipment');
CREATE TYPE time_bucket      AS ENUM ('morning', 'afternoon', 'evening');

-- ============================================================
-- 1. USER PROFILES  (extends BetterAuth `user` table)
-- ============================================================
CREATE TABLE user_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         TEXT NOT NULL UNIQUE,            -- BetterAuth user ID
    role            user_role NOT NULL DEFAULT 'customer',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    timezone        TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    phone_number    TEXT,
    whatsapp_opted_in       BOOLEAN DEFAULT false,
    google_calendar_connected BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. CUSTOMER PROFILES  (autofill data)
-- ============================================================
CREATE TABLE customer_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             TEXT NOT NULL UNIQUE REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    full_name           TEXT,
    date_of_birth       DATE,
    gender              TEXT,
    address             TEXT,
    city                TEXT,
    pincode             TEXT,
    preferred_language  TEXT DEFAULT 'en',
    emergency_contact   TEXT,
    medical_notes       TEXT,
    custom_fields       JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. SERVICES
-- ============================================================
CREATE TABLE services (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organiser_id            TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    title                   TEXT NOT NULL,
    description             TEXT,
    duration_minutes        INTEGER NOT NULL CHECK (duration_minutes > 0),
    appointment_type        appointment_type NOT NULL DEFAULT 'user',
    location                TEXT,
    venue_address           TEXT,
    is_published            BOOLEAN NOT NULL DEFAULT false,
    share_token             TEXT UNIQUE,
    advance_payment_required BOOLEAN DEFAULT false,
    manual_confirmation     BOOLEAN DEFAULT false,
    max_capacity            INTEGER,                 -- NULL = unlimited
    resource_assignment     resource_assign DEFAULT 'auto',
    google_calendar_block_enabled BOOLEAN DEFAULT false,
    timezone                TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. SERVICE QUESTIONS  (intake form)
-- ============================================================
CREATE TABLE service_questions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id           UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    question_text        TEXT NOT NULL,
    is_required          BOOLEAN NOT NULL DEFAULT false,
    display_order        INTEGER NOT NULL DEFAULT 0,
    question_type        question_type NOT NULL DEFAULT 'text',
    options              JSONB,                      -- for select type
    maps_to_profile_field TEXT,                      -- autofill key in customer_profiles
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. RESOURCES
-- ============================================================
CREATE TABLE resources (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id          UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    resource_type       resource_type NOT NULL DEFAULT 'user',
    google_calendar_id  TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. SCHEDULES + SLOTS
-- ============================================================
CREATE TABLE schedules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    schedule_type   schedule_type NOT NULL DEFAULT 'weekly',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE weekly_slots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id     UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    CHECK (end_time > start_time)
);

CREATE TABLE flexible_slots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id     UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    specific_date   DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    CHECK (end_time > start_time)
);

-- ============================================================
-- 7. BOOKINGS
-- ============================================================
CREATE TABLE bookings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id              UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    customer_id             TEXT NOT NULL REFERENCES user_profiles(user_id),
    resource_id             UUID REFERENCES resources(id),
    slot_date               DATE NOT NULL,
    slot_start              TIME NOT NULL,
    slot_end                TIME NOT NULL,
    status                  booking_status NOT NULL DEFAULT 'pending',
    capacity_booked         INTEGER NOT NULL DEFAULT 1 CHECK (capacity_booked > 0),
    payment_status          payment_status NOT NULL DEFAULT 'unpaid',
    booking_channel         booking_channel NOT NULL DEFAULT 'web',
    notes                   TEXT,
    confirmation_token      TEXT UNIQUE,
    google_calendar_event_id TEXT,
    no_show_risk_score      REAL CHECK (no_show_risk_score BETWEEN 0 AND 1),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at            TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ
);

-- ============================================================
-- 8. BOOKING ANSWERS
-- ============================================================
CREATE TABLE booking_answers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES service_questions(id) ON DELETE CASCADE,
    answer_text     TEXT
);

-- ============================================================
-- 9. WAITLIST
-- ============================================================
CREATE TABLE waitlist (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    resource_id     UUID REFERENCES resources(id),
    slot_date       DATE NOT NULL,
    slot_start      TIME NOT NULL,
    customer_id     TEXT NOT NULL REFERENCES user_profiles(user_id),
    notify_token    TEXT UNIQUE,
    notify_expires_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount              NUMERIC(10,2) NOT NULL,
    currency            TEXT NOT NULL DEFAULT 'INR',
    payment_method      payment_method,
    payment_status      payment_status NOT NULL DEFAULT 'pending_payment',
    gateway_reference   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. WHATSAPP SESSIONS
-- ============================================================
CREATE TABLE whatsapp_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number    TEXT NOT NULL,
    session_state   JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_active     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 minutes')
);

-- ============================================================
-- 12. VOICE SESSIONS
-- ============================================================
CREATE TABLE voice_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sid        TEXT NOT NULL UNIQUE,
    phone_number    TEXT NOT NULL,
    language        TEXT NOT NULL DEFAULT 'en',
    session_state   JSONB NOT NULL DEFAULT '{}'::jsonb,
    current_step    INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. NO-SHOW MODEL FEATURES  (ML training data)
-- ============================================================
CREATE TABLE no_show_model_features (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id                  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    lead_time_hours             REAL NOT NULL,
    day_of_week                 SMALLINT NOT NULL,
    time_of_day_bucket          time_bucket NOT NULL,
    customer_booking_count      INTEGER NOT NULL DEFAULT 0,
    customer_cancellation_rate  REAL NOT NULL DEFAULT 0,
    customer_no_show_rate       REAL NOT NULL DEFAULT 0,
    service_cancellation_rate   REAL NOT NULL DEFAULT 0,
    booking_channel             booking_channel NOT NULL DEFAULT 'web',
    payment_status              payment_status NOT NULL DEFAULT 'unpaid',
    outcome                     SMALLINT CHECK (outcome IN (0, 1))  -- 0=showed, 1=no-show
);

-- ============================================================
-- INDEXES
-- ============================================================

-- User lookups
CREATE INDEX idx_user_profiles_user_id   ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role      ON user_profiles(role);
CREATE INDEX idx_customer_profiles_user  ON customer_profiles(user_id);

-- Service lookups
CREATE INDEX idx_services_organiser      ON services(organiser_id);
CREATE INDEX idx_services_published      ON services(is_published) WHERE is_published = true;
CREATE INDEX idx_services_share_token    ON services(share_token) WHERE share_token IS NOT NULL;

-- Schedule / slot lookups
CREATE INDEX idx_schedules_service       ON schedules(service_id);
CREATE INDEX idx_weekly_day              ON weekly_slots(schedule_id, day_of_week);
CREATE INDEX idx_flexible_date           ON flexible_slots(schedule_id, specific_date);

-- Booking lookups  (critical for availability algorithm)
CREATE INDEX idx_bookings_service_date   ON bookings(service_id, slot_date, slot_start, slot_end);
CREATE INDEX idx_bookings_customer       ON bookings(customer_id);
CREATE INDEX idx_bookings_status         ON bookings(status);
CREATE INDEX idx_bookings_resource       ON bookings(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX idx_bookings_channel        ON bookings(booking_channel);

-- Waitlist
CREATE INDEX idx_waitlist_slot           ON waitlist(service_id, slot_date, slot_start);
CREATE INDEX idx_waitlist_customer       ON waitlist(customer_id);

-- Questions
CREATE INDEX idx_questions_service_order ON service_questions(service_id, display_order);

-- Resources
CREATE INDEX idx_resources_service       ON resources(service_id);

-- Answers
CREATE INDEX idx_answers_booking         ON booking_answers(booking_id);

-- ML features
CREATE INDEX idx_noshow_booking          ON no_show_model_features(booking_id);

-- WhatsApp session lookup
CREATE INDEX idx_wa_phone                ON whatsapp_sessions(phone_number);

-- Voice session lookup
CREATE INDEX idx_voice_callsid           ON voice_sessions(call_sid);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customer_profiles_updated
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_services_updated
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- NOTE: These policies use auth.uid() which maps to BetterAuth's
-- user ID stored in user_profiles.user_id. Adjust the mapping
-- function if your BetterAuth ↔ Supabase integration differs.
-- For Django DRF access, use a service_role key that bypasses RLS.

-- ---------- user_profiles ----------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
    ON user_profiles FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users update own profile"
    ON user_profiles FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Admins read all profiles"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()::text AND up.role = 'admin'
        )
    );

-- ---------- customer_profiles ----------
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own customer profile"
    ON customer_profiles FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Customers update own customer profile"
    ON customer_profiles FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Customers insert own customer profile"
    ON customer_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

-- ---------- services ----------
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published services"
    ON services FOR SELECT
    USING (is_published = true);

CREATE POLICY "Organisers manage own services"
    ON services FOR ALL
    USING (organiser_id = auth.uid()::text);

CREATE POLICY "Admins read all services"
    ON services FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()::text AND up.role = 'admin'
        )
    );

-- ---------- service_questions ----------
ALTER TABLE service_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads questions of published services"
    ON service_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_id AND s.is_published = true
        )
    );

CREATE POLICY "Organisers manage own service questions"
    ON service_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_id AND s.organiser_id = auth.uid()::text
        )
    );

-- ---------- bookings ----------
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own bookings"
    ON bookings FOR SELECT
    USING (customer_id = auth.uid()::text);

CREATE POLICY "Customers insert bookings"
    ON bookings FOR INSERT
    WITH CHECK (customer_id = auth.uid()::text);

CREATE POLICY "Customers update own bookings"
    ON bookings FOR UPDATE
    USING (customer_id = auth.uid()::text);

CREATE POLICY "Organisers read bookings for own services"
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_id AND s.organiser_id = auth.uid()::text
        )
    );

CREATE POLICY "Organisers update bookings for own services"
    ON bookings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_id AND s.organiser_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins read all bookings"
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()::text AND up.role = 'admin'
        )
    );

-- ---------- waitlist ----------
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own waitlist"
    ON waitlist FOR ALL
    USING (customer_id = auth.uid()::text);

CREATE POLICY "Organisers read waitlist for own services"
    ON waitlist FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_id AND s.organiser_id = auth.uid()::text
        )
    );

-- ---------- payments ----------
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id AND b.customer_id = auth.uid()::text
        )
    );

CREATE POLICY "Organisers read payments for own services"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN services s ON s.id = b.service_id
            WHERE b.id = booking_id AND s.organiser_id = auth.uid()::text
        )
    );

-- ---------- resources ----------
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads resources of published services"
    ON resources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_id AND s.is_published = true
        )
    );

CREATE POLICY "Organisers manage own resources"
    ON resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM services s
            WHERE s.id = service_id AND s.organiser_id = auth.uid()::text
        )
    );

-- ---------- booking_answers ----------
ALTER TABLE booking_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own booking answers"
    ON booking_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id AND b.customer_id = auth.uid()::text
        )
    );

CREATE POLICY "Customers insert own booking answers"
    ON booking_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id AND b.customer_id = auth.uid()::text
        )
    );

CREATE POLICY "Organisers read answers for own service bookings"
    ON booking_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN services s ON s.id = b.service_id
            WHERE b.id = booking_id AND s.organiser_id = auth.uid()::text
        )
    );

-- ============================================================
-- SUPABASE REALTIME — Enable on bookings table
-- ============================================================
-- Run in Supabase Dashboard → Database → Replication:
--   ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
-- This lets the frontend subscribe to booking changes per
-- service_id + slot_date for live slot availability updates.

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Generate a unique share token for a service
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(12), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Generate a unique confirmation token for a booking
CREATE OR REPLACE FUNCTION generate_confirmation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN 'BK' || upper(encode(gen_random_bytes(4), 'hex'));
END;
$$ LANGUAGE plpgsql;

-- Auto-set confirmation_token on booking insert
CREATE OR REPLACE FUNCTION set_booking_defaults()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.confirmation_token IS NULL THEN
        NEW.confirmation_token := generate_confirmation_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_defaults
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_booking_defaults();

-- Auto-set confirmed_at / cancelled_at on status change
CREATE OR REPLACE FUNCTION set_booking_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        NEW.confirmed_at := now();
    END IF;
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        NEW.cancelled_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_timestamps
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_booking_timestamps();
