# Customer-Side Task Split — Full R&D Features

## Two Roles

| Role | Focus | Total |
|---|---|---|
| **Person A** — Booking Engine | Service browsing, booking flow (all 6 steps), slot locking, payment, realtime | ~16h |
| **Person B** — Management & Intelligence | Profile/autofill, booking management, cancel/reschedule, waitlist, AI bot, smart UX | ~14h |

---

## Person A — The Booking Engine

### A1. Service Browsing (3h)
**Files to create:**
- `app/(customer)/services/page.tsx` — service grid with search/filter
- `app/(customer)/services/[id]/page.tsx` — service detail page
- `app/components/customer/ServiceCard.tsx` — card component
- `app/components/customer/ServiceDetail.tsx` — detail with schedule preview

**Key details:**
- Grid of published services with name, organiser, duration, location, "Book Now" button
- Service detail page shows description, schedule overview, intake questions preview
- "Book Now" → navigates to `/book/[serviceId]`
- "Book via Call" button → calls `POST /api/voice/request-callback/`
- Search bar filters by title (client-side for hackathon)

---

### A2. Booking Flow — Multi-Step Wizard (8–10h) ⚡ Critical Path
**Files to create:**
- `app/(customer)/book/[serviceId]/page.tsx` — wizard container
- `app/stores/bookingStore.ts` — Zustand state machine
- `app/components/booking/ResourceSelector.tsx` — Step 0
- `app/components/booking/DatePicker.tsx` — Step 1
- `app/components/booking/SlotGrid.tsx` — Step 2 (realtime)
- `app/components/booking/CapacitySelector.tsx` — Step 3
- `app/components/booking/IntakeForm.tsx` — Step 4 (with autofill)
- `app/components/booking/PaymentStep.tsx` — Step 5
- `app/components/booking/Confirmation.tsx` — Step 6

#### Zustand Store Shape (`bookingStore.ts`)
```ts
interface BookingState {
  step: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  serviceId: string | null;
  resourceId: string | null;
  selectedDate: string | null;
  selectedSlot: { start: string; end: string } | null;
  capacity: number;
  answers: { questionId: string; value: string }[];
  holdId: string | null;        // soft reservation ID
  bookingId: string | null;     // after POST /api/bookings/
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
  // actions
  setStep: (step: number) => void;
  selectSlot: (slot) => void;
  reset: () => void;
}
```

#### Step-by-Step Implementation

**Step 0 — Resource Selector** (conditional)
- Only renders if `service.appointment_type === 'resource'`
- Fetches resources for the service, shows radio/card selector
- Skipped entirely for user-type services

**Step 1 — Date Picker**
- Calendar UI (use `react-day-picker` or custom)
- Read URL params `?date=` for deep link pre-selection
- Highlight dates with availability (call `GET /api/services/<id>/next-available/`)
- On select → advance to Step 2

**Step 2 — Slot Grid** ⚡ Most important visual
- Calls `GET /api/services/<id>/availability/?date=<date>&resource_id=<id>`
- Renders time slots in a grid with confidence indicators:
  - 🟢 Green dot = many available
  - 🟡 Amber = last 2 remaining  
  - 🔴 Red = last 1
  - ⬜ Gray = booked/held
- **Supabase Realtime subscription** (subscribe to BOTH `bookings` AND `slot_holds`)
- On slot click → **Layer 1**: optimistic UI (gray out immediately in Zustand)
- On slot click → **Layer 2**: call `POST /api/slots/hold/` to create soft reservation
- Advance to Step 3

**Step 3 — Capacity Selector** (conditional)
- Only if `service.max_capacity > 1`
- Number input with min=1, max=remaining capacity
- Skip for capacity=1 services

**Step 4 — Intake Form**
- Fetch `GET /api/profile/autofill/?service=<id>`
- Render each `service_question` as form field (text/select/boolean)
- Pre-fill with autofill data, show source labels ("From your profile" / "From your last visit")
- **Heartbeat**: send `PATCH /api/slots/hold/<id>/` every 3 minutes to keep hold alive
- Validate required fields before advancing

**Step 5 — Payment** (conditional)
- Only if `service.advance_payment_required === true`
- Three tabs: Card, UPI, PayPal
- **Card mock**: Luhn validation, CVV length, expiry check
- On submit → `POST /api/payments/<booking_id>/` → simulate 1.5s processing → `GET /api/payments/<booking_id>/status/`
- 15-minute countdown timer (from booking creation)
- Poll `GET /api/bookings/<id>/status/` every 30s
- On timer expire → redirect to "Session expired" page with "Start over" (pre-selects same service+date)
- **beforeunload** handler → triggers abandoned payment recovery flow on backend

**Step 6 — Confirmation**
- Two states: ✅ Confirmed (green) / ⏳ Reserved (yellow, pending organiser approval)
- "Add to Google Calendar" button → `POST /api/integrations/google-calendar/push-booking/<id>/`
- "Share with someone" → generates deep link to service booking page, WhatsApp share
- Profile completion banner if < 80% complete
- **Conflict warning**: before Step 6, check `GET /api/bookings/mine/?date=<date>` for time overlap

**Smart back-navigation**: preserve Zustand state on Back button. Hold stays active.

**Deep link support**: on mount, read `?date=`, `?resource=` from URL → pre-select and skip to slot picker.

---

### A3. Slot Locking System (included in A2, but separate backend concern)
**New DB table needed** (add to schema):
```sql
CREATE TABLE slot_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id),
    slot_date DATE NOT NULL,
    slot_start TIME NOT NULL,
    slot_end TIME NOT NULL,
    session_token TEXT NOT NULL,
    capacity_held INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_holds_service_date ON slot_holds(service_id, slot_date);
```

**Frontend cleanup**: on Next.js route change → `DELETE /api/slots/hold/<id>/`

---

### A4. Smart "No Slots" Experience (1h)
- When availability returns empty:
  - Show next 3 available dates as clickable chips (from `GET /api/services/<id>/next-available/`)
  - "Join Waitlist" button
  - "Notify me for any date" toggle → creates waitlist entry with `slot_date = null`

---

## Person B — Management & Intelligence

### B1. Customer Profile Page (3h)
**Files to create:**
- `app/(customer)/profile/page.tsx` — profile page
- `app/components/customer/ProfileForm.tsx` — edit form
- `app/components/customer/BookingTimeline.tsx` — vertical timeline

**Key details:**
- Profile edit form: name, phone, DOB, gender, city, preferred language, WhatsApp opt-in toggle
- Google Calendar connect button → OAuth popup → `POST /api/integrations/google-calendar/connect/`
- **Booking history timeline**: vertical timeline grouped by month, not a plain table
  - Each card shows: service icon, channel badge (web/WhatsApp/voice icon), status badge, date
  - Color coding: green=confirmed, yellow=pending, red=cancelled, gray=completed
- Timezone detection: `Intl.DateTimeFormat().resolvedOptions().timeZone` → save to profile

---

### B2. Booking Management — View, Cancel, Reschedule (5h)
**Files to create:**
- `app/(customer)/booking/[id]/page.tsx` — booking detail
- `app/(customer)/reschedule/[id]/page.tsx` — reschedule flow
- `app/components/customer/BookingDetail.tsx` — detail card
- `app/components/customer/RescheduleWizard.tsx` — date+slot re-picker
- `app/components/customer/CancelDialog.tsx` — cancel confirmation

**Booking Detail Page:**
- Service name, date/time, resource, status badge, channel badge
- Intake answers displayed (read-only)
- Action buttons: "Reschedule" / "Cancel" (conditionally shown)
- Cancel rules displayed: "Free cancellation until 24h before" / "Late cancellation fee may apply"

**Cancel Flow:**
- Confirmation dialog: "Are you sure? This cannot be undone."
- Calls `POST /api/bookings/<id>/cancel/`
- On success → redirect to services page or booking list
- **Email cancel link**: build `app/(customer)/cancel/[token]/page.tsx` — unauthenticated cancel page
  - "Cancel your appointment? [Yes, cancel] [No, keep it]"
  - Calls `GET /api/bookings/cancel/<confirmation_token>/`

**Reschedule Flow:**
- Shows current booking at top: "Currently: May 6 at 10am"
- Fresh date picker → slot grid (same components as booking flow, reused)
- Confirmation modal: "Change from May 6 at 10am → May 8 at 2pm?"
- Calls `POST /api/bookings/<id>/reschedule/` (atomic swap on backend)
- Answers are inherited — no re-entry needed
- On success: "Appointment rescheduled" confirmation

---

### B3. Waitlist System (2h)
**Files to create:**
- `app/components/customer/WaitlistSection.tsx` — on profile/bookings page
- `app/components/booking/JoinWaitlist.tsx` — CTA when slot is full
- `app/(customer)/waitlist/claim/[token]/page.tsx` — claim page from email

**On profile page:**
- "You're on the waitlist" section
- Shows: service, date, slot, position ("You are #2 in line")
- "Leave waitlist" button → `DELETE /api/waitlist/<id>/`

**Claim page:**
- Validates token and expiry
- Shows slot details: "A slot opened up! May 6 at 10am — Dental Consultation"
- "Claim this slot" button → `GET /api/waitlist/claim/<token>/` → auto-books
- Expired token → "This link has expired. You'll be notified if another slot opens."

---

### B4. AI Chat Bot Widget (4h)
**Files to create:**
- `app/components/customer/ChatWidget.tsx` — floating widget
- `app/stores/chatStore.ts` — Zustand conversation state
- `app/api/ai/chat/route.ts` — already exists, needs implementation

**Widget UI:**
- Floating button bottom-right with chat bubble icon + badge
- Expandable panel (slide-up on mobile, side panel on desktop)
- Message bubbles: user (right, indigo) / assistant (left, gray)
- Typing indicator (3 dots animation)
- When bot detects booking action → inline "Proceed to payment" button
- "Try the booking form instead" fallback link at bottom

**Chat Store:**
```ts
interface ChatState {
  isOpen: boolean;
  messages: { role: 'user' | 'assistant'; content: string }[];
  pendingBooking: Partial<BookingState> | null;
  isLoading: boolean;
  toggle: () => void;
  sendMessage: (msg: string) => Promise<void>;
}
```

---

### B5. Smart UX Features (sprinkle across modules, 2h)
These are enhancements added to Person A's and Person B's components:

| Feature | Where | Implementation |
|---|---|---|
| Timezone banner | SlotGrid (A2) | Detect browser TZ vs service TZ, show banner |
| Conflict detection | Confirmation (A2) | Check `GET /api/bookings/mine/?date=` before confirm |
| Slot confidence dots | SlotGrid (A2) | Green/amber/red based on `remaining/max` ratio |
| Profile completion banner | Confirmation (A2) | Calculate % from non-null fields, show if < 80% |
| Deep link pre-selection | BookingFlow (A2) | Read `?date=&resource=` URL params on mount |
| Post-booking share | Confirmation (A2) | WhatsApp share link + copy button |

> [!NOTE]
> Person B implements these as small utility functions/components, then Person A integrates them into the booking flow.

---

## Shared Dependencies to Install

```bash
npm install zustand @tanstack/react-query react-day-picker date-fns
```

---

## Build Order (Parallel Timeline)

```
Hour 0-2:   A → Service browsing pages    |  B → Profile page + form
Hour 2-4:   A → Zustand store + DatePicker |  B → Booking timeline + detail page
Hour 4-8:   A → SlotGrid + Realtime       |  B → Cancel + Reschedule flows
Hour 8-12:  A → IntakeForm + Autofill     |  B → AI Chat Bot widget
Hour 12-14: A → Payment step              |  B → Waitlist system
Hour 14-16: A → Confirmation + deep links |  B → Smart UX features integration
```

> [!IMPORTANT]
> **Hour 0 agreement**: Both people must agree on the Zustand `bookingStore` shape before starting. Person B's reschedule flow reuses Person A's DatePicker and SlotGrid components.
