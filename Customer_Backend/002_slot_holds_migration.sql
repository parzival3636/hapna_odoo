-- ============================================================
-- MIGRATION 002: Slot Holds Table
-- Run this in Supabase SQL Editor before starting Customer_Backend
-- ============================================================

CREATE TABLE IF NOT EXISTS slot_holds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID NOT NULL REFERENCES services_service(id) ON DELETE CASCADE,
    resource_id     UUID REFERENCES services_resource(id) ON DELETE CASCADE,
    slot_date       DATE NOT NULL,
    slot_start      TIME NOT NULL,
    slot_end        TIME NOT NULL,
    session_token   TEXT NOT NULL,
    capacity_held   INTEGER NOT NULL DEFAULT 1,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holds_service_date ON slot_holds(service_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_holds_expires      ON slot_holds(expires_at);
CREATE INDEX IF NOT EXISTS idx_holds_token        ON slot_holds(session_token);
