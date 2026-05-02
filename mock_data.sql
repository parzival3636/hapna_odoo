-- Mock Data for Hapna Odoo Customer Backend Testing

-- =====================================================================
-- 1. Setup "Consultancy" Service (ID: 3c158908-dbfc-4709-b859-8547a2bb03e8)
-- This is a 'user' appointment type service.
-- =====================================================================

-- Create a Schedule (Weekly)
INSERT INTO public.services_schedule (id, schedule_type, timezone, service_id) 
VALUES ('11111111-1111-1111-1111-111111111111', 'weekly', 'Asia/Kolkata', '3c158908-dbfc-4709-b859-8547a2bb03e8')
ON CONFLICT DO NOTHING;

-- Create Weekly Slots (Mon-Fri, 09:00 to 17:00)
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
INSERT INTO public.services_weeklyslot (id, day_of_week, start_time, end_time, schedule_id) VALUES
('22222222-2222-2222-2222-222222222221', 1, '09:00:00', '17:00:00', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222222', 2, '09:00:00', '17:00:00', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222223', 3, '09:00:00', '17:00:00', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222224', 4, '09:00:00', '17:00:00', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222225', 5, '09:00:00', '17:00:00', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Create Service Questions
INSERT INTO public.services_servicequestion (id, question_text, is_required, display_order, question_type, options, service_id) VALUES
('33333333-3333-3333-3333-333333333331', 'What is your main goal for this consultancy?', true, 1, 'multi_line', NULL, '3c158908-dbfc-4709-b859-8547a2bb03e8'),
('33333333-3333-3333-3333-333333333332', 'Have you booked with us before?', true, 2, 'boolean', NULL, '3c158908-dbfc-4709-b859-8547a2bb03e8'),
('33333333-3333-3333-3333-333333333333', 'Which department do you want to talk to?', false, 3, 'select', '["Sales", "Support", "Engineering"]', '3c158908-dbfc-4709-b859-8547a2bb03e8')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 2. Setup "New Service" (ID: f60b22bf-b109-4892-b455-cf4630db301a)
-- We'll modify this into a 'resource' appointment type to test that flow!
-- =====================================================================

-- Change it to resource-based and set capacity to 5
UPDATE public.services_service 
SET appointment_type = 'resource', max_capacity = 5
WHERE id = 'f60b22bf-b109-4892-b455-cf4630db301a';

-- Create Resources for it
INSERT INTO public.services_resource (id, name, resource_type, google_calendar_id, is_active, service_id, user_id) VALUES
('44444444-4444-4444-4444-444444444441', 'Conference Room A', 'room', NULL, true, 'f60b22bf-b109-4892-b455-cf4630db301a', NULL),
('44444444-4444-4444-4444-444444444442', 'Conference Room B', 'room', NULL, true, 'f60b22bf-b109-4892-b455-cf4630db301a', NULL)
ON CONFLICT DO NOTHING;

-- Schedule for the resource-based service
INSERT INTO public.services_schedule (id, schedule_type, timezone, service_id) 
VALUES ('55555555-5555-5555-5555-555555555555', 'weekly', 'Asia/Kolkata', 'f60b22bf-b109-4892-b455-cf4630db301a')
ON CONFLICT DO NOTHING;

-- Weekly slots for the resource-based service (Weekend only, 10:00 to 14:00)
INSERT INTO public.services_weeklyslot (id, day_of_week, start_time, end_time, schedule_id) VALUES
('66666666-6666-6666-6666-666666666666', 0, '10:00:00', '14:00:00', '55555555-5555-5555-5555-555555555555'),
('66666666-6666-6666-6666-666666666667', 6, '10:00:00', '14:00:00', '55555555-5555-5555-5555-555555555555')
ON CONFLICT DO NOTHING;
